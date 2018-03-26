import unittest

ALL_TESTS_SUITE = unittest.TestLoader().discover('.', pattern='*test*.py')

if __name__ == '__main__':
    runner = unittest.TextTestRunner()
    runner.run(ALL_TESTS_SUITE)
