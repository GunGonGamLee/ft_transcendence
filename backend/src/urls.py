from django.contrib import admin
from django.urls import include, path, re_path
from django.conf import settings
from rest_framework import routers, permissions
from drf_yasg.views import get_schema_view
from drf_yasg import openapi

router = routers.DefaultRouter()

schema_view = get_schema_view(
    openapi.Info(
        title="ft_transcendence API",
        default_version="v1.0.0",
        description="GunGonGamLee's ft_transcendence API",
        terms_of_service="https://www.google.com/policies/terms/",
    ),
    public=True,
    permission_classes=[permissions.AllowAny, ],
)


urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/', include('api.urls')),
    re_path(r'^redoc/$', schema_view.with_ui('redoc',
            cache_timeout=0), name='schema-redoc'),
    path('', include('django_prometheus.urls')),
]

# DEBUG 모드일 경우, ui 없이 swagger view를 사용할 수 있도록 설정
if settings.DEBUG:
    urlpatterns += [
        re_path(r'^swagger(?P<format>\.json|\.yaml)$',
                schema_view.without_ui(cache_timeout=0), name='schema-json'),
        re_path(r'^swagger/$', schema_view.with_ui('swagger',
                cache_timeout=0), name='schema-swagger-ui'),
    ]
