from django.contrib import admin
from django.urls import include, path

# Une app = un préfixe d'URL sous /api/ (ajouté quand l'app est créée)
urlpatterns = [
    path("admin/", admin.site.urls),
    path("api/core/", include("core.urls")),
]
