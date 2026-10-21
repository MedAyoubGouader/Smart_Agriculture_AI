from django.contrib import admin
from django.urls import include, path
from django.views.generic import RedirectView

urlpatterns = [
    path("", RedirectView.as_view(pattern_name="cartographie:index", permanent=False)),
    path("admin/", admin.site.urls),
    path("carte/", include("cartographie.urls")),
    path("comptes/", include("comptes.urls")),
    path("referentiels/", include("referentiels.urls")),
    path("donnees/", include("donnees.urls")),
    path("analyses/", include("analyses.urls")),
    path("prediction/", include("prediction.urls")),
]
