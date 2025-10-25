import * as tf from '@tensorflow/tfjs';
import { Prediction } from '../types';

// Model configuration
const MODEL_URL = '/models/mobilenetv3/model.json'; // Place your model files here
const CLASS_NAMES = ['Healthy', 'Blight', 'Leaf Curl', 'Mosaic Virus'];

let model: tf.LayersModel | null = null;

/**
 * Load the TensorFlow.js model (call once on app init)
 * @returns Promise<tf.LayersModel>
 */
export const loadModel = async (): Promise<tf.LayersModel> => {
  if (model) return model;
  
  try {
    console.log('Loading TensorFlow.js model...');
    model = await tf.loadLayersModel(MODEL_URL);
    console.log('Model loaded successfully');
    return model;
  } catch (error) {
    console.error('Failed to load model:', error);
    throw new Error('Model loading failed. Please check model files.');
  }
};

/**
 * Run inference on preprocessed image tensor
 * @param imageTensor - Preprocessed image tensor (224x224x3)
 * @returns Promise<Prediction[]> - Top 3 predictions with confidence
 */
export const runInference = async (imageTensor: tf.Tensor): Promise<Prediction[]> => {
  if (!model) {
    throw new Error('Model not loaded. Call loadModel() first.');
  }
  
  try {
    // Run prediction
    const predictions = model.predict(imageTensor) as tf.Tensor;
    const probabilities = await predictions.data();
    
    // Convert to prediction objects
    const results: Prediction[] = CLASS_NAMES.map((className, index) => ({
      className,
      probability: probabilities[index]
    }));
    
    // Sort by confidence and return top 3
    const sortedResults = results
      .sort((a, b) => b.probability - a.probability)
      .slice(0, 3);
    
    // Clean up tensors
    predictions.dispose();
    imageTensor.dispose();
    
    return sortedResults;
  } catch (error) {
    console.error('Inference failed:', error);
    throw new Error('Inference failed. Please try again.');
  }
};

/**
 * Get AI focus hints for explainability
 * @param className - Predicted class name
 * @returns string[] - Focus areas the AI considers
 */
export const getAIFocusHints = (className: string): string[] => {
  const focusHints: Record<string, string[]> = {
    'Healthy': [
      'Uniform green coloration',
      'Smooth leaf texture',
      'No visible spots or discoloration',
      'Proper leaf shape and size'
    ],
    'Blight': [
      'Dark brown/black spots',
      'Yellow halos around lesions',
      'Leaf wilting patterns',
      'Stem discoloration'
    ],
    'Leaf Curl': [
      'Upward leaf curling',
      'Yellowing between veins',
      'Reduced leaf size',
      'Plant stunting indicators'
    ],
    'Mosaic Virus': [
      'Mottled light/dark green patterns',
      'Irregular leaf shapes',
      'Vein clearing patterns',
      'Growth distortion signs'
    ]
  };
  
  return focusHints[className] || focusHints['Healthy'];
};

/**
 * Check if model is ready for inference
 * @returns boolean
 */
export const isModelReady = (): boolean => {
  return model !== null;
};

/**
 * Get model info for debugging
 * @returns object with model details
 */
export const getModelInfo = () => {
  if (!model) return null;
  
  return {
    inputShape: model.inputs[0].shape,
    outputShape: model.outputs[0].shape,
    totalParams: model.countParams(),
    classNames: CLASS_NAMES
  };
};