from django.contrib.auth.models import AbstractUser, BaseUserManager
from django.db import models


class UserManager(BaseUserManager):
    def create_user(self, email, **extra_fields):
        if not email:
            raise ValueError('이메일 주소는 필수입니다.')
        email = self.normalize_email(email)
        user = self.model(email=email, **extra_fields)
        user.save(using=self._db)
        return user


class User(AbstractUser):
    """
        AbstractUser가 제공하는 필드들을 포함한다.
        ID, PASSWORD, last_login, is_superuser, username, first_name,
        last_name, email, is_staff, is_active, date_joined
    """
    username = None  # 필드 제거
    password = None
    first_name = None
    last_name = None
    is_staff = None

    USERNAME_FIELD = 'email'  # 이메일을 주 사용자 식별자로 설정
    REQUIRED_FIELDS = []  # email은 USERNAME_FIELD로 사용되므로 여기서 제외

    objects = UserManager()

    email = models.EmailField('이메일 주소', unique=True, max_length=254)  # 이메일
    nickname = models.CharField(max_length=8, unique=True, blank=True, null=True)  # 닉네임
    rating = models.PositiveIntegerField(default=0)  # 레이팅
    avatar = models.ImageField(
        null=True,
        upload_to='avatar/',
    )  # 아바타 이미지
    verification_code = models.CharField(max_length=6, blank=True, null=True)   # 이메일 인증 코드
    is_online = models.BooleanField(default=False) # 온라인 여부
    custom_1vs1_wins = models.IntegerField(default=0)
    custom_tournament_wins = models.IntegerField(default=0)
    rank_wins = models.IntegerField(default=0)

    class Meta:
        db_table = 'users'
