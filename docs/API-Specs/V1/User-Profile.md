# User Profile API Spec

## Defining Capabilities

A user should be able to:

1. Set their preferred name
1. Set their major
1. Set their graduation year
1. Set a short bio for themselves
1. Set a longer description for their profile
1. Add professional experiences
1. Add research experiences
1. Set Profile Visibility
1. Add Links to other sites like a portfolio site or LinkedIn
1. Upload, provide a link to, or use a randomly generated profile picture
1. List all of their projects (public and draft)
1. Be able to see other users profile information
1. See another user's public projects

### View User's Profile GET `/api/v1/user/[user_id]`

Gets all information about the user's profile. Will return 404 if the specified user's profile is private and the caller is not the owner of the profile.

#### Request

Headers: `Content-Type`: `application/json`

Query Strings: none

Body: None

#### Response

Headers: `Content-Type`: `application/json`

Body:

```typescript
{
    firstName: string,
    lastName: string,
    degrees: {
        degreeType: string,
        degreeName: string,
        graduationYear: number
    }[],
    bio: string,
    description: string,
    professionalExperience: {
        title: string,
        company: string,
        startDate: string,
        ongoing: boolean,
        endDate: string,
        description: string
    } [],
    researchExperience: {
        title: string,
        researchGroup: string,
        piName: string,
        startDate: string,
        ongoing: boolean,
        endDate: string,
        description: string
    } [],
    visibility: "PUBLIC" | "PRIVATE",
    profilePictureLink: string,
} | string
```

Status Codes:

- 200: OK
  - All fields will be populated with the correct values
- 401: Unauthorized
  - The caller is not a logged in user
  - Body will be an error message
- 403: Forbidden
  - The user trying to make this request is not the user who owns the profile
  - The body will be an error message
- 404: Not Found
  - The specified user was not found
  - The body will be an error message
- 429: Rate Limit Exceeded
  - The body will be an error message
- 500: Internal Server Error
  - The body will be an error message

### Set Preferred Name PUT `/api/v1/user/[user_id]/name`

Sets the user's preferred name, since some users may
have a preferred name that differs from what the auth
system gives us.

#### Request

Headers: `Content-Type`: `application/json`

Query Strings: none

Body:

```typescript
{
firstName: string,
lastName: string
} | string
```

#### Response

Headers: `Content-Type`: `application/json`

Body:

```typescript
{
    firstName: string,
    lastName: string
} | string
```

Status Codes:

- 200: OK
  - `firstName` and `lastName` will be populated with the updated values
- 401: Unauthorized
  - The caller is not a logged in user
  - Body will be an error message
- 403: Forbidden
  - The user trying to make this request is not the user who owns the profile
  - The body will be an error message
- 404: Not Found
  - The specified user was not found
  - The body will be an error message
- 429: Rate Limit Exceeded
  - The body will be an error message
- 500: Internal Server Error
  - The body will be an error message

### Add Degree POST `api/v1/user/[user_id]/degree`

Adds an empty education / degree field for the user to populate.

#### Request

Headers: None

Query Strings: none

Body: None

#### Response

Headers: `Content-Type`: `application/json`

Body:

```typescript
{
    university: "Rensselaer Polytechnic Institute", // We assume that their degree is from RPI since they are an active RPI student
    degreeType: "",
    field: "",
    startDate: string, // Will assume that the start date was August of the current year
    endDate: string, // Will assume May of start_year + 4
} | string
```

Status Codes:

- 200: OK
  - Body attributes will be populated with the expected values
- 401: Unauthorized
  - The caller is not a logged in user
  - Body will be an error message
- 403: Forbidden
  - The user trying to make this request is not the user who owns the profile
  - The body will be an error message
- 404: Not Found
  - The specified user was not found
  - The body will be an error message
- 429: Rate Limit Exceeded
  - The body will be an error message
- 500: Internal Server Error
  - The body will be an error message

### Update Degree PUT `api/v1/user/[user_id]/degree/[degree_id]`

Updates the information about the user's degree.

#### Request

Headers: `Content-Type`: `application/json`

Query Strings: none

Body:

```typescript
{
    university: string,
    degreeType: string,
    field: string,
    startDate: string,
    endDate: string,
}
```

#### Response

Headers: `Content-Type`: `application/json`

Body:

```typescript
{
    university: string,
    degreeType: string,
    field: string,
    startDate: string,
    endDate: string,
} | string
```

Status Codes:

- 200: OK
  - Body attributes will be populated with the updated values
- 401: Unauthorized
  - The caller is not a logged in user
  - Body will be an error message
- 403: Forbidden
  - The user trying to make this request is not the user who owns the profile
  - The body will be an error message
- 404: Not Found
  - The specified user was not found
  - The body will be an error message
- 429: Rate Limit Exceeded
  - The body will be an error message
- 500: Internal Server Error
  - The body will be an error message

### Remove Degree DELETE `api/v1/user/[user_id]/degree/[degree_id]`

Removes a specific educational experience field.

#### Request

Headers: None

Query Strings: none

Body: None

#### Response

Headers: `Content-Type`: `application/json`

Body:

```typescript
string | undefined;
```

Status Codes:

- 200: OK
  - Body will be undefined
- 401: Unauthorized
  - The caller is not a logged in user
  - Body will be an error message
- 403: Forbidden
  - The user trying to make this request is not the user who owns the profile
  - The body will be an error message
- 404: Not Found
  - The specified user was not found
  - The body will be an error message
- 429: Rate Limit Exceeded
  - The body will be an error message
- 500: Internal Server Error
  - The body will be an error message

### Set User Bio PUT `api/v1/user/[user_id]/bio`

Allows the user to update their bio. The bio is a short, 400 character max plain-text description of the user.

#### Request

Headers: `Content-Type`: `application/json`

Query Strings: None

Body:

```typescript
{
  bio: string;
}
```

#### Response

Headers: `Content-Type`: `application/json`

Body:

```typescript
{
    bio: string
} | string
```

Status Codes:

- 200: OK
  - Body will be populated with the updated bio
- 400: Bad Request
  - The bio is longer than the 400 character maximum
  - Body will be an error message
- 401: Unauthorized
  - The caller is not a logged in user
  - Body will be an error message
- 403: Forbidden
  - The user trying to make this request is not the user who owns the profile
  - The body will be an error message
- 404: Not Found
  - The specified user was not found
  - The body will be an error message
- 429: Rate Limit Exceeded
  - The body will be an error message
- 500: Internal Server Error
  - The body will be an error message

### Set User Description PUT `api/v1/user/[user_id]/description`

Allows a user to update their own description. The description is a longer rich-text description with a length limit of 5000 characters.

#### Request

Headers: `Content-Type`: `application/json`

Query Strings: None

Body:

```typescript
{
  description: string;
}
```

#### Response

Headers: `Content-Type`: `application/json`

Body:

```typescript
{
    description: string
} | string
```

Status Codes:

- 200: OK
  - Body will be populated with the updated description
- 400: Bad Request
  - The description is longer than the 5000 character maximum
  - Body will be an error message
- 401: Unauthorized
  - The caller is not a logged in user
  - Body will be an error message
- 403: Forbidden
  - The user trying to make this request is not the user who owns the profile
  - The body will be an error message
- 404: Not Found
  - The specified user was not found
  - The body will be an error message
- 429: Rate Limit Exceeded
  - The body will be an error message
- 500: Internal Server Error
  - The body will be an error message

### Add Professional Experience POST `api/v1/user/[user_id]/job`

Creates a field for the user to enter their professional experience.

#### Request

Headers: None

Query Strings: none

Body: None

#### Response

Headers: `Content-Type`: `application/json`

Body:

```typescript
{
    company: "",
    title: "",
    startDate: "",
    ongoing: false
    endDate: "",
    description: ""
} | string
```

Status Codes:

- 200: OK
  - Body attributes will be populated with the expected values
- 401: Unauthorized
  - The caller is not a logged in user
  - Body will be an error message
- 403: Forbidden
  - The user trying to make this request is not the user who owns the profile
  - The body will be an error message
- 404: Not Found
  - The specified user was not found
  - The body will be an error message
- 429: Rate Limit Exceeded
  - The body will be an error message
- 500: Internal Server Error
  - The body will be an error message

### Update Professional Experience PUT `api/v1/user/[user_id]/job/[job_id]`

Allows a user to update information about their professional experience.

#### Request

Headers: `Content-Type`: `application/json`

Query Strings: none

Body:

```typescript
{
    title: string,
    company: string,
    startDate: string,
    ongoing: boolean,
    endDate: string,
    description: string
}
```

#### Response

Headers: `Content-Type`: `application/json`

Body:

```typescript
{
    title: string,
    company: string,
    startDate: string,
    ongoing: boolean,
    endDate: string,
    description: string
} | string
```

Status Codes:

- 200: OK
  - Body attributes will be populated with the updated values
- 401: Unauthorized
  - The caller is not a logged in user
  - Body will be an error message
- 403: Forbidden
  - The user trying to make this request is not the user who owns the profile
  - The body will be an error message
- 404: Not Found
  - The specified user was not found
  - The body will be an error message
- 429: Rate Limit Exceeded
  - The body will be an error message
- 500: Internal Server Error
  - The body will be an error message

### Remove Professional Experience DELETE `api/v1/user/[user_id]/job/[job_id]`

Allows a user to remove one of their professional experience fields.

#### Request

Headers: None

Query Strings: none

Body: None

#### Response

Headers: `Content-Type`: `application/json`

Body:

```typescript
string | undefined;
```

Status Codes:

- 200: OK
  - Body attributes will be undefined
- 401: Unauthorized
  - The caller is not a logged in user
  - Body will be an error message
- 403: Forbidden
  - The user trying to make this request is not the user who owns the profile
  - The body will be an error message
- 404: Not Found
  - The specified user was not found
  - The body will be an error message
- 429: Rate Limit Exceeded
  - The body will be an error message
- 500: Internal Server Error
  - The body will be an error message

### Add Research Experience POST `api/v1/user/[user_id]/research`

Adds a research experience field to the User's profile.

#### Request

Headers: None

Query Strings: none

Body: None

#### Response

Headers: `Content-Type`: `application/json`

Body:

```typescript
{
    title: "",
    researchGroup: "",
    piName: "",
    startDate: "",
    ongoing: false,
    endDate: "",
    description: ""
} | string
```

Status Codes:

- 200: OK
  - Body attributes will be populated with the expected values
- 401: Unauthorized
  - The caller is not a logged in user
  - Body will be an error message
- 403: Forbidden
  - The user trying to make this request is not the user who owns the profile
  - The body will be an error message
- 404: Not Found
  - The specified user was not found
  - The body will be an error message
- 429: Rate Limit Exceeded
  - The body will be an error message
- 500: Internal Server Error
  - The body will be an error message

### Update Research Experience PUT `api/v1/user/[user_id]/research/[research_id]`

Allows a user to update one of their research experiences.

#### Request

Headers: `Content-Type`: `application/json`

Query Strings: none

Body:

```typescript
{
    title: string,
    researchGroup: string,
    piName: string,
    startDate: string,
    ongoing: boolean,
    endDate: string,
    description: string
}
```

#### Response

Headers: `Content-Type`: `application/json`

Body:

```typescript
{
    title: string,
    researchGroup: string,
    piName: string,
    startDate: string,
    ongoing: boolean,
    endDate: string,
    description: string
} | string
```

Status Codes:

- 200: OK
  - Body attributes will be populated with the updated values
- 401: Unauthorized
  - The caller is not a logged in user
  - Body will be an error message
- 403: Forbidden
  - The user trying to make this request is not the user who owns the profile
  - The body will be an error message
- 404: Not Found
  - The specified user was not found
  - The body will be an error message
- 429: Rate Limit Exceeded
  - The body will be an error message
- 500: Internal Server Error
  - The body will be an error message

### Remove Research Experience DELETE `api/v1/user/[user_id]/research/[research_id]`

Allows a user to remove a specific research experience from their profile.

#### Request

Headers: None

Query Strings: none

Body: None

#### Response

Headers: `Content-Type`: `application/json`

Body:

```typescript
string | undefined;
```

Status Codes:

- 200: OK
  - Body attributes will be undefined
- 401: Unauthorized
  - The caller is not a logged in user
  - Body will be an error message
- 403: Forbidden
  - The user trying to make this request is not the user who owns the profile
  - The body will be an error message
- 404: Not Found
  - The specified user was not found
  - The body will be an error message
- 429: Rate Limit Exceeded
  - The body will be an error message
- 500: Internal Server Error
  - The body will be an error message

### Update Profile Visibility PUT `api/v1/user/[user_id]/visibility`

Allows the user to specify whether their profile is visible or hidden to other users. 

### Change Profile Picture POST `api/v1/user/[user_id]/pic`

### Serve Profile Picture GET `api/v1/user/[user_id]/pic`

### List User's Projects GET `api/v1/user/[user_id]/projects`
