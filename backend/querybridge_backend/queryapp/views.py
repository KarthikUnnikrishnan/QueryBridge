from django.shortcuts import render

# Create your views here.
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
import json

@csrf_exempt
def execute_query(request):
    if request.method == "POST":
        data = json.loads(request.body)
        query = data.get("query", "")

        return JsonResponse({
            "status": "success",
            "received_query": query,
            "message": "Query received successfully"
        })

    return JsonResponse({
        "status": "error",
        "message": "Only POST requests allowed"
    })
