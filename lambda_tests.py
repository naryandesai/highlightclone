import unittest
import requests
class TestAdd(unittest.TestCase):
    """
    Test that calling session endpoint with these parameters:
    9900&arkadiusz.krawczyk.1993@gmail.com&bio&80
    9900 - the price
    arkadiusz.krawczyk.1993@gmail.com - email of person making order
    bio - name of book
    80 - random timestamp to prevent browser caching

    Succeeds and creates correct stripe session.

    """

    def test_session_endpoint_creates_correct_stripe_session(self):
      resp = requests.get('https://8wrro7by93.execute-api.us-east-1.amazonaws.com/ferret/session/9900&arkadiusz.krawczyk.1993@gmail.com&bio&false')
      self.assertEqual(resp.json()['success_url'][:resp.json()['success_url'].rfind('&')], 'https://8wrro7by93.execute-api.us-east-1.amazonaws.com/ferret/email/arkadiusz.krawczyk.1993@gmail.com&bio&false&9900')
      self.assertEqual(resp.json()['amount_total'], 9900)


    """
    email endpoint registers a sale, parameters arkadiusz.krawczyk.1993@gmail.com&bio&false&9900 mean
    arkadiusz.krawczyk.1993@gmail.com - person who bought boook
    bio - name of book
    false - send email (true if we want email, false if not)
    9900 - price of book

    Charge endpoint with parameters arkadiusz.krawczyk.1993@gmail.com&bio means
    we want to check if person with this email bought book 'bio'. Response is the amount they paid last for it.

    """

    def test_buying_and_querying(self):
      resp = requests.get('https://8wrro7by93.execute-api.us-east-1.amazonaws.com/ferret/email/arkadiusz.krawczyk.1993@gmail.com&bio&false&9900')
      resp = requests.get('https://8wrro7by93.execute-api.us-east-1.amazonaws.com/ferret/charge/arkadiusz.krawczyk.1993@gmail.com&bio')
      self.assertEqual(resp.text, '9900')

      resp = requests.get('https://8wrro7by93.execute-api.us-east-1.amazonaws.com/ferret/charge/arkadiusz.krawczyk.1993@gmail.com&comp')
      self.assertEqual(resp.text, '0')






if __name__ == '__main__':
    unittest.main()