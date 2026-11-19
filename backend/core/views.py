from django.db import DatabaseError, connection
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from rest_framework.views import APIView


class HealthView(APIView):
    """Vérifie que l'API répond et que la base PostgreSQL est joignable."""

    permission_classes = [AllowAny]

    def get(self, request):
        try:
            with connection.cursor() as cursor:
                cursor.execute("SHOW server_version")
                version = cursor.fetchone()[0]
            return Response({"status": "ok", "database": f"PostgreSQL {version}"})
        except DatabaseError:
            return Response({"status": "error", "database": "injoignable"}, status=503)
