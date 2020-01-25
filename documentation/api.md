API Documentation
====

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
  token: string
}
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
  token: string
}
```

## Get Profile

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

response = {
  userProfile: Profile
}
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

response = {
  [...Profile]
}
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
    longitude: number,
    latitude: number, 
  }
}

response = {
  profile: Profile
}
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
    userId: number,
    liked: boolean, 
  } 
}

response = {
  matched: boolean
}
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
  matches: Profile[];
}
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

response = {
  image: Image
}
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

response = {
  undefined
}
```