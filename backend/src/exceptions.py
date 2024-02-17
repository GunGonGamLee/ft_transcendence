class GetDataException(Exception):
    pass


class AuthenticationException(Exception):
    def __init__(self, message):
        self.message = message
        super().__init__(self.message)


class TokenCreateException(Exception):
    def __init__(self, message):
        self.message = message
        super().__init__(self.message)


class VerificationException(Exception):
    def __init__(self, message):
        self.message = message
        super().__init__(self.message)
