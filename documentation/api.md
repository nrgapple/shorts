# API Documentation

## Login

```js
request = {
  url: `${apiURL}/public/login`,
  method: 'POST',
  headers: {
    'Accept': 'application/json',
    'Content-Type': 'application/json'
  },
  data: {
    username: string,
    password: string,
  }
}

response = {
  token as string
};
```

## Sign up

```js
request = {
  url: `${apiURL}/public/signup`,
  method: 'POST',
  headers: {
    'Accept': 'application/json',
    'Content-Type': 'application/json'
  },
  data: {
    username: string,
    password: string,
    dob: Date().toString(),
    firstName: string,
    lastName: string,
    email: string,
  }
}

response = {
  token as string
};
```

## Get User Profile

```js
request = {
  url: `${apiURL}/secure/profile`,
  method: 'GET',
  headers: {
    'Authorization': `Bearer ${token}`,
    'Accept': 'application/json',
    'Content-Type': 'application/json'
  },
}

response = {} as Profile;
```

## Get Near me profiles

```js
request = {
  url: `${apiURL}/secure/profiles`,
  method: 'GET',
  headers: {
    'Authorization': `Bearer ${token}`,
    'Accept': 'application/json',
    'Content-Type': 'application/json'
  },
}

response = [] as Profile[];
```

## Post current location

```js
reqeust = {
  url: `${apiURL}/secure/location`,
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  },
  data: {
    longitude as number,
    latitude as number,
  }
}

response = {

} as Profile;
```

## Post swipe

```js
request = {
   url: `${apiURL}/secure/swipe`,
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
  data: {
    userId as number,
    liked as boolean,
  }
}

response = {
  matched as boolean
};
```

## Get matches

```js
request = {
  url: `${apiURL}/secure/matches`,
  method: 'GET',
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
}

response = {
  matches as Profile[];
};
```

## Post image

```js
request = {
  url: `${apiURL}/secure/image`,
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${token}`,
    'Accept': 'application/json',
  },
  data: formData():File
}

response = {} as Image;
```

## Delete image

```js
request = {
  url: `${apiURL}/secure/image/${imageId}`,
  method: 'DELETE',
  headers: {
    'Authorization': `Bearer ${token}`,
    'Accept': 'application/json',
  },
}

response = undefined;
```

## Get Messages

```js
request = {
  {
    url: `${apiURL}/secure/messages/${chatId}`,
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
      'Accept': 'application/json',
  }
}

response = [] as Message[];
```

## Create Chat

```js
request = {
  url: `${apiURL}/secure/chat/${userId}`,
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
}

response = {} as Chat;
```

## Get Chats

```js
request = {
  url: `${apiURL}/secure/chats`,
  method: 'GET',
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
}

response = [] as Chat[];
```
