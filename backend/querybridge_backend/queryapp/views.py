from django.shortcuts import render

# Create your views here.
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from django.db import connection
import json

# Allowed SQL operations
ALLOWED_KEYWORDS = ("select", "insert", "delete", "show", "describe")

@csrf_exempt
def execute_query(request):
    if request.method != "POST":
        return JsonResponse({
            "status": "error",
            "message": "Only POST requests allowed"
        })

    try:
        data = json.loads(request.body)
        sql = data.get("query", "").strip()

        if not sql:
            return JsonResponse({
                "status": "error",
                "message": "Empty query"
            })

        # Safety check
        if not sql.lower().startswith(ALLOWED_KEYWORDS):
            return JsonResponse({
                "status": "error",
                "message": "Unsupported or unsafe SQL operation"
            })

        with connection.cursor() as cursor:
            cursor.execute(sql)

            # SELECT queries
            if sql.lower().startswith("select"):
                columns = [col[0] for col in cursor.description]
                rows = cursor.fetchall()

                result = [
                    dict(zip(columns, row))
                    for row in rows
                ]

                return JsonResponse({
                    "status": "success",
                    "type": "select",
                    "columns": columns,
                    "rows": result
                })

            # INSERT / DELETE
            return JsonResponse({
                "status": "success",
                "type": "modify",
                "message": "Query executed successfully"
            })

    except Exception as e:
        return JsonResponse({
            "status": "error",
            "message": str(e)
        })
