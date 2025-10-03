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

## Other Notes

> For things like links, degrees, jobs, and research where there are multiple items. There is a 3 step process:
> At creation, a blank / default one is created and displayed to the screen, then the client calls to the update
> endpoint and updates the data. If the user wants to remove that specific one, they call to the delete endpoint

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
    statusCode: number,
    message: string,
    profile: {
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
    }
}
```

Status Codes:

- 200: OK
  - All fields will be populated with the correct values
- 401: Unauthorized
  - The caller is not a logged in user
  - Body.message will be an error message
- 403: Forbidden
  - The user trying to make this request is not the user who owns the profile
  - The body.message will be an error message
- 404: Not Found
  - The specified user was not found
  - The body.message will be an error message
- 429: Rate Limit Exceeded
  - The body.message will be an error message
- 500: Internal Server Error
  - The body.message will be an error message

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
    statusCode: number,
    message: string,
    firstName: string,
    lastName: string
}
```

Status Codes:

- 200: OK
  - `firstName` and `lastName` will be populated with the updated values
- 401: Unauthorized
  - The caller is not a logged in user
  - Body.message will be an error message
- 403: Forbidden
  - The user trying to make this request is not the user who owns the profile
  - The body.message will be an error message
- 404: Not Found
  - The specified user was not found
  - The body.message will be an error message
- 429: Rate Limit Exceeded
  - The body.message will be an error message
- 500: Internal Server Error
  - The body.message will be an error message

### Add Degree POST `api/v1/user/[user_id]/degree`

Adds an empty education / degree name for the user to populate.

#### Request

Headers: None

Query Strings: none

Body: None

#### Response

Headers: `Content-Type`: `application/json`

Body:

```typescript
{
    statusCode: number,
    message: string,
    university: "Rensselaer Polytechnic Institute", // We assume that their degree is from RPI since they are an active RPI student
    degreeType: "",
    degreeName: "",
    startDate: string, // Will assume that the start date was August of the current year
    endDate: string, // Will assume May of start_year + 4
} | string
```

Status Codes:

- 200: OK
  - Body attributes will be populated with the expected values
- 401: Unauthorized
  - The caller is not a logged in user
  - Body.message will be an error message
- 403: Forbidden
  - The user trying to make this request is not the user who owns the profile
  - The body.message will be an error message
- 404: Not Found
  - The specified user was not found
  - The body.message will be an error message
- 429: Rate Limit Exceeded
  - The body.message will be an error message
- 500: Internal Server Error
  - The body.message will be an error message

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
    degreeName: string,
    startDate: string,
    endDate: string,
}
```

#### Response

Headers: `Content-Type`: `application/json`

Body:

```typescript
{
    statusCode: number,
    message: string,
    degree: {
        university: string,
        degreeType: string,
        degreeName: string,
        startDate: string,
        endDate: string,
    }
}
```

Status Codes:

- 200: OK
  - Body attributes will be populated with the updated values
- 401: Unauthorized
  - The caller is not a logged in user
  - Body.message will be an error message
- 403: Forbidden
  - The user trying to make this request is not the user who owns the profile
  - The body.message will be an error message
- 404: Not Found
  - The specified user was not found
  - The body.message will be an error message
- 429: Rate Limit Exceeded
  - The body.message will be an error message
- 500: Internal Server Error
  - The body.message will be an error message

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
{
    statusCode: number,
    message: string,
}
```

Status Codes:

- 200: OK
  - Body will be populated accordingly
- 401: Unauthorized
  - The caller is not a logged in user
  - Body.message will be an error message
- 403: Forbidden
  - The user trying to make this request is not the user who owns the profile
  - The body.message will be an error message
- 404: Not Found
  - The specified user was not found
  - The body.message will be an error message
- 429: Rate Limit Exceeded
  - The body.message will be an error message
- 500: Internal Server Error
  - The body.message will be an error message

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
    statusCode: number,
    message: string,
    bio: string
}
```

Status Codes:

- 200: OK
  - Body will be populated with the updated bio
- 400: Bad Request
  - The bio is longer than the 400 character maximum
  - Body.message will be an error message
- 401: Unauthorized
  - The caller is not a logged in user
  - Body.message will be an error message
- 403: Forbidden
  - The user trying to make this request is not the user who owns the profile
  - The body.message will be an error message
- 404: Not Found
  - The specified user was not found
  - The body.message will be an error message
- 429: Rate Limit Exceeded
  - The body.message will be an error message
- 500: Internal Server Error
  - The body.message will be an error message

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
    statusCode: number,
    message: string,
    description: string
}
```

Status Codes:

- 200: OK
  - Body will be populated with the updated description
- 400: Bad Request
  - The description is longer than the 5000 character maximum
  - Body.message will be an error message
- 401: Unauthorized
  - The caller is not a logged in user
  - Body.message will be an error message
- 403: Forbidden
  - The user trying to make this request is not the user who owns the profile
  - The body.message will be an error message
- 404: Not Found
  - The specified user was not found
  - The body.message will be an error message
- 429: Rate Limit Exceeded
  - The body.message will be an error message
- 500: Internal Server Error
  - The body.message will be an error message

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
    statusCode: number,
    message: string,
    job: {
        company: "",
        title: "",
        startDate: "",
        ongoing: false
        endDate: "",
        description: ""
    }
} | string
```

Status Codes:

- 200: OK
  - Body attributes will be populated with the expected values
- 401: Unauthorized
  - The caller is not a logged in user
  - Body.message will be an error message
- 403: Forbidden
  - The user trying to make this request is not the user who owns the profile
  - The body.message will be an error message
- 404: Not Found
  - The specified user was not found
  - The body.message will be an error message
- 429: Rate Limit Exceeded
  - The body.message will be an error message
- 500: Internal Server Error
  - The body.message will be an error message

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
    statusCode: number,
    message: string,
    job: {
        title: string,
        company: string,
        startDate: string,
        ongoing: boolean,
        endDate: string,
        description: string
    }
}
```

Status Codes:

- 200: OK
  - Body attributes will be populated with the updated values
- 401: Unauthorized
  - The caller is not a logged in user
  - Body.message will be an error message
- 403: Forbidden
  - The user trying to make this request is not the user who owns the profile
  - The body.message will be an error message
- 404: Not Found
  - The specified user was not found
  - The body.message will be an error message
- 429: Rate Limit Exceeded
  - The body.message will be an error message
- 500: Internal Server Error
  - The body.message will be an error message

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
{
    statusCode: number,
    message: string,
}
```

Status Codes:

- 200: OK
  - Body attributes will be populated accordingly
- 401: Unauthorized
  - The caller is not a logged in user
  - Body.message will be an error message
- 403: Forbidden
  - The user trying to make this request is not the user who owns the profile
  - The body.message will be an error message
- 404: Not Found
  - The specified user was not found
  - The body.message will be an error message
- 429: Rate Limit Exceeded
  - The body.message will be an error message
- 500: Internal Server Error
  - The body.message will be an error message

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
    statusCode: number,
    message: string,
    research: {
        title: "",
        researchGroup: "",
        piName: "",
        startDate: "",
        ongoing: false,
        endDate: "",
        description: ""
    }
}
```

Status Codes:

- 200: OK
  - Body attributes will be populated with the expected values
- 401: Unauthorized
  - The caller is not a logged in user
  - Body.message will be an error message
- 403: Forbidden
  - The user trying to make this request is not the user who owns the profile
  - The body.message will be an error message
- 404: Not Found
  - The specified user was not found
  - The body.message will be an error message
- 429: Rate Limit Exceeded
  - The body.message will be an error message
- 500: Internal Server Error
  - The body.message will be an error message

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
    statusCode: number,
    message: string,
    research:{
        title: string,
        researchGroup: string,
        piName: string,
        startDate: string,
        ongoing: boolean,
        endDate: string,
        description: string
    }
}
```

Status Codes:

- 200: OK
  - Body attributes will be populated with the updated values
- 401: Unauthorized
  - The caller is not a logged in user
  - Body.message will be an error message
- 403: Forbidden
  - The user trying to make this request is not the user who owns the profile
  - The body.message will be an error message
- 404: Not Found
  - The specified user was not found
  - The body.message will be an error message
- 429: Rate Limit Exceeded
  - The body.message will be an error message
- 500: Internal Server Error
  - The body.message will be an error message

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
{
    statusCode: number,
    message: string,
}
```

Status Codes:

- 200: OK
  - Body attributes will be set accordingly
- 401: Unauthorized
  - The caller is not a logged in user
  - Body.message will be an error message
- 403: Forbidden
  - The user trying to make this request is not the user who owns the profile
  - The body.message will be an error message
- 404: Not Found
  - The specified user was not found
  - The body.message will be an error message
- 429: Rate Limit Exceeded
  - The body.message will be an error message
- 500: Internal Server Error
  - The body.message will be an error message

### Update Profile Visibility PUT `api/v1/user/[user_id]/visibility`

Allows the user to specify whether their profile is visible or hidden to other users.

#### Request

Headers: `Content-Type`: `application/json`

Query Strings: None

Body:

```typescript
{
  visibility: "PUBLIC" | "PRIVATE";
}
```

#### Response

Headers: `Content-Type`: `application/json`

Body:

```typescript
{
    statusCode: number,
    message: string,
    visibility: "PUBLIC" | "PRIVATE"
}
```

Status Codes:

- 200: OK
  - Body will be populated with the updated visibility
- 400: Bad Request
  - The visibility is not one of either `PUBLIC` or `PRIVATE`
  - Body.message will be an error message
- 401: Unauthorized
  - The caller is not a logged in user
  - Body.message will be an error message
- 403: Forbidden
  - The user trying to make this request is not the user who owns the profile
  - The body.message will be an error message
- 404: Not Found
  - The specified user was not found
  - The body.message will be an error message
- 429: Rate Limit Exceeded
  - The body.message will be an error message
- 500: Internal Server Error
  - The body.message will be an error message

### Change Profile Picture POST `api/v1/user/[user_id]/pic`

Uploads an image to the MinIO database and sets it as the user's profile pic. Max image upload size: 1MB

#### Request

Headers:

- `Content-Type`:
  - `image/png` for Portable Network Graphics images.
  - `image/jpeg` for Joint Photographic Experts Group images.
  - `image/gif` for Graphics Interchange Format images.
  - `image/svg+xml` for Scalable Vector Graphics images.
  - `image/webp` for WebP images.
  - `image/x-icon` for ICO (icon) files.
  - `application/json` for links to external images.

Query Params:
None

Body:
The file object of the image being uploaded. Or

```typescript
{
  image: string;
}
```

if you are adding an external image link.

#### Response

Headers:
`content-type`: `application/json`

Body:

```typescript
{
    statusCode: number,
    message: string,
    id: string;
    link: string;
    alt: string;
} | string
```

Status:

- 201: Image Uploaded Successfully
  - All fields will be populated with relevant info.
- 400: Bad Request
  - If the Content-Type of this endpoint is not one of the above this will be returned.
  - If the image uploaded is more than 1MB.
  - Body is an error message
- 401: Unauthorized, the user's session token is missing or invalid
  - Body is an error message
- 403: The user is not the owner of the profile trying to be modified.
  - Body is an error message
- 404: The requested user does not exist or is a private account
  - Body is an error message
- 429: Rate Limit Exceeded.
  - Body is an error message
- 500: Internal Server Error
  - Body is an error message

### Serve Profile Picture GET `api/v1/user/[user_id]/pic`

Serves the profile picture of the specified user if the profile picture was uploaded. Can be called by anyone. If the profile is private, then this will return a 404. If the user is using a default avatar or an external link as an image, this endpoint will return 400.

#### Request

Headers:
None

Query Params:
None

Body:
None

#### Response

Headers:

- `Content-Type`:
  - `image/png` for Portable Network Graphics images.
  - `image/jpeg` for Joint Photographic Experts Group images.
  - `image/gif` for Graphics Interchange Format images.
  - `image/svg+xml` for Scalable Vector Graphics images.
  - `image/webp` for WebP images.
  - `image/x-icon` for ICO (icon) files.

Body:
ReadableStream of Image Data or an error message.

Status:

- 200: Image was served.
- 404: The user was not found, the profile is private, or the profile picture is not a user uploaded picture
- 429: Rate Limit Exceeded.
- 500: Internal Server Error
  - Body.message will be an error message

### List User's Projects GET `api/v1/user/[user_id]/projects`

List's a users projects. Returns 404 if the caller is not the specified user, and their profile is private.
Returns only public projects if the caller is not the specified user and the profile is public. Returns all projects, public and draft, if the user is the owner of the profile.

#### Request

Headers: None

Query Strings:

- Limit, min = 0, max = 100, the number of projects to list
- NextToken, the continuation token used in pagination, if undefined list will start from the beginning

Body: None

#### Response

Headers: `Content-Type`: `application/json`

Body:

```typescript
{
  statusCode: number,
  message: string,
  projects: {
    projectId?: string;
    title: string,
    description: string,
    contributors: string[],
    skillTags: string[],
    group: string | undefined,
    thumbnail: {
        link: string,
        caption: string
    } | null,
    projectVisibility: "PUBLIC" | "DRAFT"
  }[],
  nextToken: string,
} | string
```

Status Codes:

- 200: OK
  - All relevant fields will be populated
- 400: Bad Request
  - The limit value was not within the range 0 - 100
  - Body.message will be an error message
- 404: Not Found
  - Either the profile does not exist, or the profile is private and the caller is not the owner
  - Body.message will be an error message
- 429: Rate Limit Exceeded
  - Body.message will be an error message
- 500: Internal Server Error
  - Body.message will be an error message

### Add Link `POST` `/api/v1/user/[user_id]/link`

Creates a new blank link on the user's profile.

#### Request

Headers:
None

Query Params:
None

Body:
None

#### Response

Headers:

- `Content-Type`: `application/json`

Body:

```typescript
{
    statusCode: number,
    message: string,
    id: string;
    url: "";
    label: "";
}
```

Status:

- 201: Created Successfully
  - Body will be populated with relevant info.
- 401: The session token is missing or invalid.
  - Body.message will be an error message
- 403: The user is not the owner of the profile being edited
  - Body.message will be an error message
- 429: Rate Limit Exceeded.
- 500: Internal Server Error
  - Body.message will be an error message

### Update Link `PUT` `/api/v1/user/[user_id]/link/[link_id]`

Updates the link url and cover text, returning the new values.

#### Request

Headers:
`Content-Type`: `application/json`

Query Params:
None

Body:

```typescript
{
  url: string; // The URL must be a full URL (including http/https) it cannot be relative
  label: string;
}
```

#### Response

Headers:

- `Content-Type`: `application/json`

Body:

```typescript
{
    statusCode: number,
    message: string,
    url: string;
    label: string;
    id: string;
}
```

Status:

- 200: Updated Successfully
  - Body will be populated with the updated link info.
- 401: The session token is missing or invalid.
  - Body.message will be an error message
- 403: The user is not the owner of the profile they are trying to edit
  - Body.message will be an error message
- 404: The link specified does not exist
  - Body will say "Link does not exist"
- 429: Rate Limit Exceeded.
- 500: Internal Server Error
  - Body.message will be an error message

### Delete Link `DELETE` `/api/v1/user/[user_id]/link/[link_id]`

Removes the specified link from the caller's profile.

#### Request

Headers:
None

Query Params:
None

Body:
None

#### Response

Headers:

- `Content-Type`: `application/json`

Body:

```typescript
{
    statusCode: number,
    message: string,
}
```

Status:

- 200: Deleted Successfully
  - Body will be set as expected
- 401: The session token is missing or invalid.
  - Body.message will be an error message
- 403: The user is trying to edit a profile they do not own
  - Body.message will be an error message
- 404: The link could not be found
  - Message will say "Link does not exist"
- 429: Rate Limit Exceeded.
- 500: Internal Server Error
  - Body.message will be an error message
