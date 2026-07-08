from fastapi import FastAPI, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
import tensorflow as tf
import numpy as np
import cv2
import base64
import io
from PIL import Image

# 1. INITIALIZE THE SERVER
app = FastAPI(title="Aphelion Neural Oracle")

# 2. OPEN THE BRIDGE (CORS Middleware)
# This explicitly allows your React UI (or any local port) to talk to this Python server.
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# 3. LOAD THE AI MODEL
# Make sure your .keras file is in the exact same folder as this script!
try:
    model = tf.keras.models.load_model('aphelion_mobilenetv2.keras')
    print("STATUS: APHELION NEURAL NETWORK ONLINE.")
    
    print(f"!!! ALERT: THIS MODEL WAS TRAINED ON EXACTLY {model.output_shape[-1]} CLASSES !!!")
    
    # We attempt to auto-detect the last convolutional layer for Grad-CAM
    last_conv_layer = None
    for layer in reversed(model.layers):
        if 'conv' in layer.name.lower():
            last_conv_layer = layer.name
            break
except Exception as e:
    print(f"CRITICAL ERROR LOADING MODEL: {e}")
    model = None

# 4. CELESTIAL CLASSIFICATIONS (The 12 Categories from your project)
# 4. CELESTIAL CLASSIFICATIONS (Must be strictly alphabetical to match Keras training)
CELESTIAL_CLASSES = [
    "ASTEROID FIELD", 
    "BLACK HOLE", 
    "COSMIC DUST", 
    "DARK MATTER ANOMALY", 
    "EXOPLANET", 
    "GALAXY CLUSTER", 
    "NEBULA", 
    "PULSAR", 
    "QUASAR", 
    "SOLAR FLARE", 
    "SUPERNOVA", 
    "WORMHOLE"
]

# 5. THE GRAD-CAM ALGORITHM
def generate_gradcam(img_array, model, last_conv_layer_name):
    try:
        # Create a model that maps the input image to the activations of the last conv layer as well as the output predictions
        grad_model = tf.keras.models.Model(
            [model.inputs], 
            [model.get_layer(last_conv_layer_name).output, model.output]
        )

        with tf.GradientTape() as tape:
            conv_outputs, predictions = grad_model(img_array)
            top_pred_index = tf.argmax(predictions[0])
            top_class_channel = predictions[:, top_pred_index]

        # Extract gradients
        grads = tape.gradient(top_class_channel, conv_outputs)
        pooled_grads = tf.reduce_mean(grads, axis=(0, 1, 2))
        
        # Multiply each channel in the feature map array by "how important this channel is"
        conv_outputs = conv_outputs[0]
        heatmap = conv_outputs @ pooled_grads[..., tf.newaxis]
        heatmap = tf.squeeze(heatmap)

        # Normalize the heatmap between 0 and 1
        heatmap = tf.maximum(heatmap, 0) / tf.math.reduce_max(heatmap)
        return heatmap.numpy()
    except Exception as e:
        print(f"Grad-CAM Failed: {e}")
        return None

# 6. THE MAIN API ENDPOINT
@app.post("/api/v1/scan")
async def process_telemetry(file: UploadFile = File(...)):
    if model is None:
        return {"prediction": "OFFLINE", "confidence": "0%", "heatmap": None}

    # Read the image sent from React
    contents = await file.read()
    image = Image.open(io.BytesIO(contents)).convert('RGB')
    
    # Preprocess for MobileNetV2 (Resize to 224x224)
    # Preprocess for MobileNetV2 (Resize to 128x128)
    img_resized = image.resize((128, 128))
    img_array = tf.keras.preprocessing.image.img_to_array(img_resized)
    img_array = np.expand_dims(img_array, axis=0)
    img_array = tf.keras.applications.mobilenet_v2.preprocess_input(img_array)

    # 1. RUN PREDICTION
    predictions = model.predict(img_array)
    predicted_index = np.argmax(predictions[0])
    confidence = float(predictions[0][predicted_index]) * 100
    
    # Get the class name (Fallback to index if model has more/less than 12 classes)
    predicted_class = CELESTIAL_CLASSES[predicted_index] if predicted_index < len(CELESTIAL_CLASSES) else f"ANOMALY_{predicted_index}"

    # 2. RUN GRAD-CAM
    heatmap = generate_gradcam(img_array, model, last_conv_layer)
    base64_img = None

    if heatmap is not None:
        # Resize heatmap to match original image size
        heatmap = cv2.resize(heatmap, (image.width, image.height))
        heatmap = np.uint8(255 * heatmap)
        
        # Apply the Jet colormap (Sci-Fi Thermal look)
        heatmap = cv2.applyColorMap(heatmap, cv2.COLORMAP_JET)
        
        # Superimpose the heatmap on the original image
        original_img = cv2.cvtColor(np.array(image), cv2.COLOR_RGB2BGR)
        superimposed_img = cv2.addWeighted(original_img, 0.6, heatmap, 0.4, 0)
        
        # Convert to Base64 to send to React
        _, buffer = cv2.imencode('.jpg', superimposed_img)
        base64_img = base64.b64encode(buffer).decode('utf-8')

    # 3. SEND DATA BACK TO REACT
    return {
        "anomaly_class": predicted_class,
        "confidence": f"{confidence:.2f}%",
        "heatmap": base64_img
    }