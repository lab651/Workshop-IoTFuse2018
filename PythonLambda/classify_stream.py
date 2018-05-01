import json
import boto3
import base64
import os
import re

def send_notification(pred, device, time):
    sns = boto3.client('sns')
    
    prediction = pred['Prediction']
    predicted_label = prediction['predictedLabel']
    label = 'neither'
    
    if prediction['predictedScores'][predicted_label] > 0.7:
       label = predicted_label
    
    message = {
        'classification': label, 
        'device': device,
        'time': time
    }
    print(message)
    
    sns.publish(
        TargetArn=os.environ['CLASSIFY_TOPIC'],
        Message=json.dumps({
            'classification': label, 
            'device': device,
            'time': time
        }))
        
            
def lambda_handler(event, context):
    ml = boto3.client('machinelearning')
    
    for rec in event['records']:
        stats = json.loads(base64.b64decode(rec['data']).decode('utf-8'))

        record = {}
        for k, v in stats.items():
            k = re.sub(r'^acc\-', r'acceleration-', k)
            k = re.sub(r'^gyro\-', r'gyroscope-', k)
            record[k] = str(v)
        
        device = record.pop('device', None)
        time = record.pop('time', None)
        
        pred = ml.predict(
            MLModelId=os.environ['ML_MODEL_ID'],
            Record=record,
            PredictEndpoint=os.environ['ML_ENDPOINT']
            )
        
        send_notification(pred, device, time)
        
    return 'Successfully processed {} records.'.format(len(event['records']))