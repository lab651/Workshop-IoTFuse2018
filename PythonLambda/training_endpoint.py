from __future__ import print_function
import boto3
import logging
import json
import decimal
import os
import time
import statistics
from datetime import datetime
from functools import partial
import sys
CWD = os.path.dirname(os.path.realpath(__file__))
sys.path.insert(0, os.path.join(CWD, "modules"))

# enable basic logging to CloudWatch Logs
logger = logging.getLogger()
logger.setLevel(logging.INFO)

def calc_stats(axis, measure, points):
    pts = list(map((lambda m: m[measure][axis]), points))
    return {
        measure + '-' + axis + '-mean': statistics.mean(pts),
        measure + '-' + axis + '-stdev': statistics.stdev(pts),
        measure + '-' + axis + '-max': max(pts),
        measure + '-' + axis + '-min': min(pts),
    }

def factor_row(stats):
    row = {}
    for k, v in stats.items():
        row[k] = { 'N': str(v) }

    return row

def prediction_handler(event, context):
    payload = json.loads(event['body'])

    deviceId = event['queryStringParameters']['device']
    stats = {}
    for m in ['acceleration', 'gyroscope']:
        for a in ['x', 'y', 'z']:
            agg_func = partial(calc_stats, a, m)
            stats = { **stats, **agg_func(payload) }
    
    for k, v in stats.items():
        stats[k] = str(v)
        

    ml = boto3.client('machinelearning')
    pred = ml.predict(
        MLModelId=os.environ['ML_MODEL_ID'],
        Record=stats,
        PredictEndpoint=os.environ['ML_ENDPOINT']
        )
        
    return {
        'statusCode': 200,
        'headers': {
            'Access-Control-Allow-Origin': '*',
            'Content-Type': 'application/json'
        },
        'body': json.dumps({ 'classification': pred['Prediction']['predictedLabel']}) 
    }

def lambda_handler(event, context):
    payload = json.loads(event['body'])
   
    deviceId = event['queryStringParameters']['device']
    classification = event['queryStringParameters']['class']

    stats = {}
    for m in ['acceleration', 'gyroscope']:
        for a in ['x', 'y', 'z']:
            agg_func = partial(calc_stats, a, m)
            stats = { **stats, **agg_func(payload) }

    client = boto3.client('dynamodb')
    client.put_item(
        TableName=os.environ['FACTOR_TABLE'],
        Item={ 
            **{
                'device_id': { 'S': str(deviceId) }, 
                'time': { 'N': str(time.time()) }, 
                'result': { 'S': classification }
            }, 
            **factor_row(stats)
        },
        ReturnValues='NONE')    
    
    return { 
        'statusCode': 201, 
        'headers': {
            'Access-Control-Allow-Origin' : '*',
        }
    };
