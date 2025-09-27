# User Profile API Spec

## Defining Capabilities

A user should be able to:

1. Set their preferred name
1. Set their major
1. Set their graduation year
1. Set a short bio for themselves
1. Set a longer description for their profile
1. Add professional experiences
1. Set Profile Visibility
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
        start_date: string,
        ongoing: boolean,
        end_date: string,
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

### Update Degree PUT `api/v1/user/[user_id]/degree/[degree_id]`

### Remove Degree DELETE `api/v1/user/[user_id]/degree/[degree_id]`

### Set User Bio PUT `api/v1/user/[user_id]/bio`

### Set User Description PUT `api/v1/user/[user_id]/description`

### Add Professional Experience POST `api/v1/user/[user_id]/job`

### Update Professional Experience PUT `api/v1/user/[user_id]/job/[job_id]`

### Remove Professional Experience DELETE `api/v1/user/[user_id]/job/[job_id]`

### Update Profile Visibility PUT `api/v1/user/[user_id]/visibility`

### Change Profile Picture POST `api/v1/user/[user_id]/pic`

### Serve Profile Picture GET `api/v1/user/[user_id]/pic`

### List User's Projects GET `api/v1/user/[user_id]/projects`
