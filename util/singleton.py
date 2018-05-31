import threading


class Singleton():
    """
    Multi-thread safe singleton base class.
    Usage example:
      class Foo(Singleton):
         pass
      f = Foo.instance()
    """
    __lock = threading.Lock()
    __instance = None

    @classmethod
    def instance(cls, *args, **kwargs):
        """
        Implement the singleton pattern.
        """
        if not cls.__instance:
            with cls.__lock:
                if not cls.__instance:
                    cls.__instance = cls(*args, **kwargs)
        return cls.__instance
