from util.singelton import Singleton


def test_singleton():
    class C(Singleton):
        pass
    c1 = C.instance()
    c2 = C.instance()
    assert c1 is c2
