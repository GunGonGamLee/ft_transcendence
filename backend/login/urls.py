from django.urls import path
from .views import GoogleLoginView, FTLoginView, google_login, google_callback


urlpatterns = [
    path('google/', google_login, name="google_login"), # 이 URL이 구글 로그인 선택창 (ID 선택창)
    # path('42/', ft_login, name="login_42"),

	path('google/callback/', google_callback, name="google_callback"),
	# path('42/callback/', ft_callback, name="ft_callback"),
	
    path('google/finish/', GoogleLoginView.as_view(), name="google_login_finish"),
    path('42/finish/', FTLoginView.as_view(), name="ft_login_finish"),
]


# https://localhost:443/api/lgoin/google << 구글 로그인
