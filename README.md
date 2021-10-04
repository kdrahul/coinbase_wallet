
# Custom Wallet for Coinbase

## API List

> Note: Route format → `https://coinbasewallet.heroku.com/{main_route}/{sub_route}`

### Main Routes
- `/user` →  For Login/Registration, Auth, etc.
- `/util` →  For fetching miscellaneous information from database.
- `/payment` →  Handles transactions

#### Sub Routes

##### /user

`/register` :
- Request Type : _POST_
- Param : user_id
- Returns : Creates new record into the database with all the sent data.

`/login` :
- Request Type : _POST_
- Param : user_id
- Returns : 
- Description: Send login credentials to auth.

`/exist` :
- Request Type : _GET_
- Param : user_id
- Returns : Returns true if the _user\_id_ exists

`/deleteAccount` :
- Request Type : _DELETE_
- Param : user_id
- Returns : Returns the ID of the deleted user.

##### /payment

`/charge` :
- Request Type : _POST_
- Param : user_id
- Returns : JSON
- Description : When user initiates a payment by hitting buy or checkout, this api needs to be called. It creates a _CHARGE_ which generates all the data necessary to carry out a transaction via **Coinbase**. Find the `hosted_url` variable in JSON and present it to the user. On clicking `hosted_url` user enters Coinbase portal to carry out the next step in the payment process.

`/store_transaction` :
- Request Type : _POST_
- Param : user_id
- Returns : JSON
- Description : Currently reserved explicitly for webhooks, with special headers.

##### /util

`/details` :
- Request Type : _GET_ | _PUT_
- Param : user_id(GET) | any(PUT)
- Returns : JSON
- Description: Gets you extra information about the user and their account. Or you can add more info to the already existing info.
