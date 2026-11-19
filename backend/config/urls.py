from django.contrib import admin
from django.urls import include, path

# Une app = un préfixe d'URL sous /api/
urlpatterns = [
    path("admin/", admin.site.urls),
    path("api/core/", include("core.urls")),
    path("api/comptes/", include("comptes.urls")),
    path("api/referentiels/", include("referentiels.urls")),
    path("api/donnees/", include("donnees.urls")),
    path("api/cartographie/", include("cartographie.urls")),
    path("api/analyses/", include("analyses.urls")),
    path("api/prediction/", include("prediction.urls")),
]
