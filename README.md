
# Custom Wallet for Coinbase

## API List

> Note: Route format → `https://coinbasewallet.heroku.com/{main_route}/{sub_route}`

### Main Routes
- `/user` → For Login/Registration, Auth, etc.
- `/util` → For fetching miscellaneous information from database.
- `/payment` → Handles transactions

#### Sub Routes

##### /user


`/register` :
- Request Type : _POST_
- Param : user_id
- Returns : 

`/login` :
- Request Type : _POST_
- Param : user_id
- Returns : 
- Description:

`/exist` :
- Request Type : _GET_
- Param : user_id
- Returns : 

`/deleteAccount` :
- Request Type : _DELETE_
- Param : user_id
- Returns : 

##### /payment

`/charge` :
- Request Type : _POST_
- Param : user_id
- Returns : JSON
- Description : 

`/store_transaction` :
- Request Type : _POST_
- Param : user_id
- Returns : JSON
- Description : 

##### /util

`/register` :
- Request Type : _POST_
- Param : user_id
- Returns : 

`/login` :
- Request Type : _POST_
- Param : user_id
- Returns : 
- Description:

`/exist` :
- Request Type : _DELETE_
- Param : user_id
- Returns : 

`/deleteAccount` :
- Request Type : _DELETE_
- Param : user_id
- Returns : 
