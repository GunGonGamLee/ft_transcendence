from django.urls import path
from .views import google_login, intra42_login, google_callback, Intra42SignInCallBackView


urlpatterns = [
    path('google/', google_login, name="google_login"), # 이 URL이 구글 로그인 선택창 (ID 선택창)
    path('intra42/', intra42_login, name="42_login"),

    path('google/callback/', google_callback, name="google_callback"),
    path('intra42/callback/', Intra42SignInCallBackView.as_view(), name="intra42_callback"),
]
