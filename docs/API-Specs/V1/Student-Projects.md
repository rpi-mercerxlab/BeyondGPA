# Student Project API Specification

This document outlines all API endpoints for Create, Read, Update, and Delete (CRUD) operations that may be performed on student project postings.

## What should a user be able to do?

1. All Users should be able to search for projects by their attributes
1. A Student Creates a New Project, they are the project owner
1. Project owner should be able to give the project a title
1. Project owner should be able to add / remove contributors.
1. All contributors should be able to add and remove skill tags
1. All contributors should be able update a projects description
1. All contributors should be able upload images / specify external images.
1. All contributors should be able to add, update, or remove external links.
1. All contributors should be able add, update, or remove project question prompts.
1. Project Owner should be able to set which course / group the project was for.
1. Project Owner should be able to delete the project.
1. All users able to read project title, description, collaborators, skill tags, images, links, and group.

> [!IMPORTANT]
> All endpoints will be rate limited to one request per second per IP.

> [!IMPORTANT]
> All endpoints will receive the session token via the NextAuth cookie. No authorization header required.

## API Endpoints

### Project Search `GET` `/api/v1/project`

Lists all projects with the `public` visibility that meet the specified criteria. All users can call to this endpoint. Users can filter by keywords, the skills demonstrated on the project, or the group / course they worked on this project with. Items within the same field have an OR relationship, while each field will have an AND relationship. If a field is empty, then it is excluded from the filter

For example, the query:
`keywords`: ["Rocket", "Spaceflight"]
`skills`: ["CAD", "FEA"]
`groups`: []

Will return all projects that have "Rocket" OR "Spaceflight" OR Both in their title or description, AND
have at least either "FEA" OR "CAD" specified as one of the skills, AND
is made as a part of any group.

Search queries should be sanitized before being applied to the database.
The number of majors, skills, groups, or keywords is limited to 10 each to prevent queries from getting too expensive.
The response will be sorted by age, newest first.

#### Request

Headers:
None

Query Params:

- `limit`: The number of projects to list, optional, default is 24.
- `token`: The pagination token for listing the next set of results.
- `keywords`: A list of strings that the description and title should contain. All returned projects will contain at least one keyword from this list. Default is the empty list.
- `skills`: A list of skills that were used on the project. All returned projects will have at least one of the skills listed.
- `groups`: Lists projects that are apart of the specified groups / courses.

Body:
None

#### Response

Headers:

- `Content-Type`: `application/json`

Body:

```typescript
{
    projects: {
        project_id?: string;
        title: string,
        description: string,
        contributors: string[],
        skillTags: string[],
        group: string | undefined,
        thumbnail: {
            link: string | undefined,
            caption: string | undefined
        }
    }[];
    paginationToken?: string; // This will be the id of the item to start at.
} | string
```

Status:

- 200: Search Successful
  - The list will have at least one item. If there are more items than the limit, a pagination token will be provided, otherwise it will be undefined.
- 400: If there are too many keywords, majors, skill tags etc. (> 10 items in each category)
  - List will be empty and token will be undefined.
- 404: There were no projects found that satisfied all of the requested properties.
  - List will be empty.
- 429: Rate Limit Exceeded.
- 500: Internal Server Error
  - List will be empty.

### Project Creation: `POST` `/api/v1/project/`

This project allows a user with a student role to create an empty student project. Only authenticated users with a
student designation can create a project. The user that creates this project will be classified as the project owner.
This project will be defined with draft visibility, so its only visible to owner and contributors.

#### Request

Headers
None

Query Params
None

Body
None

#### Response

Headers:

- `Content-Type`: `application/json`

Body:

```typescript
{
    project_id?: string;
}
```

Status

- 201: Created
  - Project was created successfully
  - project_id will be the UUID for the project
- 401: Unauthorized
  - Returned if the Authorization header is blank or undefined. (The user is not logged in)
  - Could also be returned if the auth header is invalid, like the user tried to mess with their token.
  - project_id will be undefined
- 403: Forbidden
  - Returned if the user trying to create the project is not a student.
  - project_id will be undefined
- 429: Rate Limit Exceeded.
- 500: Server Error
  - An internal server error occurred.
  - project_id will be undefined

### Full Project Read: `GET` `/api/v1/project/[project_id]`

Returns the all the information for a project. All users are allowed to call to this endpoint.
If this project is marked as draft, then this will return 404 for all users except the owner and collaborator.

#### Request

Headers
None

Query Params:
None

Body:
None

#### Response

Headers

- `Content-Type`: `application/json`

Body:

```typescript
{
  project?: {
    project_id: string,
    title: string,
    owner: {
        name: string,
        email: string
    }
    contributors: {
        name: string,
        email: string,
        role: "EDITOR" | "VIEWER",
        id: string
    }[],
    skill_tags: {
        tag: string,
        id: string,
    }[],
    images: {
        link: string,
        caption: string,
        id: string,
    }[],
    thumbnail: {
        link: string | undefined,
        caption: string | undefined
    },
    links: {
        link: string,
        coverText: string,
        id: string,
    }[],
    description: string,
    questions: {
        id: string,
        questionText: string,
        answerText: string,
    }[],
    group: {
        id: string | undefined,
        name: string | undefined,
    }
    createdAt: string,
    updatedAt: string,
  }
}
```

Status:

- 200: Project Fetched Successfully
  - project will be fully populated
- 404: The requested project was not found
- 403: The user does not have permission to access this project
  - This will be returned if the project is marked as draft and the user is not the owner or a contributor.
- 429: Rate Limit Exceeded.
- 500: Internal Server Error
  - project will be undefined

### Project Delete: `DELETE` `/api/v1/project/[project_id]`

Soft Deletes the specified project. After 30 days of being soft deleted, the project and any image stored with the project will be deleted. This can only be performed by the project owner. A restoration will need to be done manually for right now.

#### Request

Headers
None

Query Params:
None

Body:
None

#### Response

Headers

- `Content-Type`: `application/json`

Body:
None

Status:

- 204: Project Deleted Successfully
- 401: The authentication token was not provided or was invalid
- 403: The user is not the owner of the project
- 404: The requested project was not found
- 429: Rate Limit Exceeded.
- 500: Internal Server Error

### Transfer Project Ownership `PUT` `/api/v1/project/[project_id]/owner`

Transfers ownership of the project to the user specified. Can only be called by the owner of the project.

#### Request

Headers:
None

Query Params:
None

Body:

```typescript
{
  email: string,
}
```

#### Response

Headers:

- `Content-Type`: `application/json`

Body:

```typescript
{
    name: string,
    email: string,
    contributors: {
        name: string,
        email: string,
        id: string,
        role: "EDITOR" | "VIEWER",
    }[],
} | string | undefined
```

Status:

- 200: Owner was updated successfully.
  - name and email fields will reflect the name and email of the new owner
- 401: The user's session token is not provided or invalid
  - body will be undefined
- 403: The user is not the project owner.
  - body will be undefined
- 404: The email of the new owner is not registered to a known user. Or the project was not found.
  - body will say either "New Owner Not Found" or "Project Not Found"
- 429: Rate Limit Exceeded.
- 500: Internal Server Error
  - body will be undefined

### Set Project Visibility `PUT` `/api/v1/project/[project_id]/visibility`

Sets the project visibility. Only the owner of the project can call to this endpoint.

#### Request

Headers:
`Content-Type`: `application/json`

Query Params:
None

Body:

```typescript
{
  visibility: "PUBLIC" | "DRAFT";
}
```

#### Response

Headers:

- `Content-Type`: `application/json`

Body:

```typescript
{
    visibility?: "PUBLIC" | "DRAFT"
}
```

Status:

- 200: Visibility Set Successfully
  - `visibility` will be set to the updated visibility value
- 400: If the specified visibility is not one of `PUBLIC` or `DRAFT`
  - `visibility` will be undefined
- 401: The user's session token is not provided or invalid
  - `visibility` will be undefined
- 403: The user is not the project owner.
  - `visibility` will be undefined
- 429: Rate Limit Exceeded.
- 500: Internal Server Error
  - `visibility` will be undefined

### Set Project Title `PUT` `/api/v1/project/[project_id]/title`

Sets the title for the project. This can only be performed by the project owner.

#### Request

Headers
`Content-Type`: `application/json`

Query Params:
None

Body:

```typescript
{
  title: string;
}
```

#### Response

Headers

- `Content-Type`: `application/json`

Body:

```typescript
{
    title?: string
}
```

Status:

- 200: Title Updated Successfully
  - title value will reflect the new title
- 400: If the title is an empty string or longer than 100 characters
  - title value will be undefined
- 401: The authentication token was not provided or was invalid
  - title value will be undefined
- 403: The user is not the owner of the project
  - title value will be undefined
- 404: The requested project was not found
  - title value will be undefined
- 429: Rate Limit Exceeded.
- 500: Internal Server Error
  - title value will be undefined

### Add Contributor `POST` `/api/v1/project/[project_id]/contributor`

Adds a new contributor to the project. This can only be performed by the project owner.

#### Request

Headers
None

Query Params:
None

Body:
None

#### Response

Headers:
none

Body:

```typescript
{
    id?: string
}
```

Status:

- 200: Contributor Updated Successfully
  - id will be populated with the UUID for the contributor
- 401: The authentication token was not provided or was invalid
- 403: The user is not the owner of the project
- 404: The requested project was not found
- 429: Rate Limit Exceeded.
- 500: Internal Server Error

### Update Contributor `PUT` `/api/v1/project/[project_id]/contributor/[contributor_id]`

Updates the name and email of the specified contributor. This can only be performed by the project owner.

#### Request

Headers
`Content-Type`: `application/json`

Query Params:
None

Body:

```typescript
{
    name: string,
    email: string,
    role: "EDITOR" | "VIEWER",
}
```

#### Response

Headers

- `Content-Type`: `application/json`

Body:

```typescript
{
    name: string,
    email: string,
    role: "EDITOR" | "VIEWER"
    id: string
} | string | undefined
```

Status:

- 200: Title Updated Successfully
  - Name and email will be set to the new value
- 401: The authentication token was not provided or was invalid
  - Body will be undefined
- 403: The user is not the owner of the project
  - Body will be undefined
- 404: The requested project was not found
  - Body will be undefined
- 429: Rate Limit Exceeded.
- 500: Internal Server Error
  - Body will be undefined

### Delete Contributor `DELETE` `/api/v1/project/[project_id]/contributor/[contributor_id]`

Removes a contributor from the project. This can only be performed by the project owner.

#### Request

Headers
None

Query Params:
None

Body:
None

#### Response

Headers

- `Content-Type`: `application/json`

Body:
None

Status:

- 204: Contributor was removed successfully
- 401: The authentication token was not provided or was invalid
- 403: The user is not the owner of the project
- 404: The requested project was not found
- 429: Rate Limit Exceeded.
- 500: Internal Server Error

### List All Existing Skill Tags `GET` `/api/v1/project/skill-tags/`

Lists all the existing skill tags. Can be called by any student.

#### Request

Headers
None

Query Params:
None

Body:
None

#### Response

Headers:
`Content-Type`: `application/json`

Body:

```typescript
{
    tags?: {
        tag_id: string,
        skill: string,
    }[]
}
```

Status:

- 200: Tags are listed in the body
  - tags will be populated with all the existing tags.
- 429: Rate Limit Exceeded.
- 500: Internal Server Error
  - tags will be undefined

### Create New Skill Tag `POST` `/api/v1/project/skill-tags/`

Creates a new skill tag on the database. This can only be called by students.

#### Request

Headers
`Content-Type`: `application/json`

Query Params:
None

Body:

```typescript
{
    skill: string,
}
```

#### Response

Headers:
`Content-Type`: `application/json`

Body:

```typescript
{
  tagId: string,
  skill: string,
} | undefined
```

Status:

- 200: Tag Added Successfully or already exists
  - tags will be populated with all the existing tags.
- 401: The authentication token was not provided or was invalid
  - tags will be undefined
- 403: The user is not a student
  - tags will be undefined
- 429: Rate Limit Exceeded.
- 500: Internal Server Error
  - tags will be undefined

### Add Skill Tag to Project `POST` `/api/v1/project/[project_id]/skill-tag/[tag_id]`

Adds a reference to a skill tag to the specified post. This can only be called by collaborators on the project with the editor role.

#### Request

Headers
None

Query Params:
None

Body:
None

#### Response

Headers:
`Content-Type`: `application/json`

Body:

```typescript
string | undefined;
```

Status:

- 200: Tag Added Successfully
  - body will be undefined
- 401: The authentication token was not provided or was invalid
  - body will be undefined
- 403: The user is not a contributor on the project or does not have the editor role.
  - body will be undefined
- 404: The requested project or skill tag was not found
  - message will either say "Project Not Found", or "Skill Tag Not Found"
- 429: Rate Limit Exceeded.
- 500: Internal Server Error
  - body will be undefined

### Remove Skill Tag `DELETE` `/api/v1/project/[project_id]/skill-tag/[tag_id]`

Removes a reference to a skill tag to the specified post. This can only be called by collaborators on the project with the editor role.

#### Request

Headers
None

Query Params:
None

Body:
None

#### Response

Headers:
`Content-Type`: `application/json`

Body:

```typescript
{ message: string} | undefined
```

Status:

- 204: Tag Removed Successfully
  - Body will be undefined
- 401: The authentication token was not provided or was invalid
  - Body will be undefined
- 403: The user is not a contributor on the project or does not have the editor role.
  - Body will be undefined
- 404: The requested project or skill tag was not found on the project
  - message will either say "Project Not Found", or "Skill Tag Not Found On Project"
- 429: Rate Limit Exceeded.
- 500: Internal Server Error
  - message will be undefined

### Update Description `PUT` `/api/v1/project/[project_id]/description`

Changes the description of the project. This can only be called by collaborators on the project with the editor role.

#### Request

Headers
`Content-Type`: `application/json`

Query Params:
None

Body:

```typescript
{
  description: string;
}
```

#### Response

Headers:
`Content-Type`: `application/json`

Body:

```typescript
{
    description?:string
}
```

Status:

- 200: Description Updated Successfully
  - `description` will reflect the updated description.
- 401: The authentication token was not provided or was invalid
  - `description` will be undefined.
- 403: The user is not a contributor on the project or does not have the editor role.
  - `description` will be undefined.
- 404: The requested project could not be found
  - `description` will be undefined.
- 429: Rate Limit Exceeded.
- 500: Internal Server Error
  - `description` will be undefined.

### Serve Image `GET` `/api/v1/project/[project_id]/image/[image_id]`

Serves the specified image. Can be called by anyone.

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
ReadableStream of Image Data or undefined.

Status:

- 200: Image was served.
- 404: Image was not found
- 403: The user does not have permission to access this image
  - This will be returned if the project is marked as draft and the user is not the owner or a contributor.
- 429: Rate Limit Exceeded.
- 500: Internal Server Error
  - Body will be undefined

### Add Image `POST` `/api/v1/project/[project_id]/image`

Uploads an image to the MinIO database and links it to this project. Can be called by all project contributors with the editor role.

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
{link: string, alt: string}
```

if you are adding an external image link.

#### Response

Headers:
`content-type`: `application/json`

Body:

```typescript
{
  id: string;
  link: string;
  alt: string;
  storageRemaining: number; // In bytes
} | undefined
```

Status:

- 201: Image Uploaded Successfully
  - All fields will be populated with relevant info.
- 400: Bad Request
  - If the Content-Type of this endpoint is not one of the above this will be returned.
  - If there are too few bytes remaining in the project's storage quota to upload this image.
- 401: Unauthorized, the user's session token is missing or invalid
- 403: The user is not a project contributor for the requested project or does not have the editor role.
- 404: The requested project does not exist
- 429: Rate Limit Exceeded.
- 500: Internal Server Error

### Update Image Alt Text `PUT` `/api/v1/project/[project_id]/image/[image_id]`

Updates the alt text for the specified image. Can be called by all project contributors with the editor role.

#### Request

Headers:
`Content-Type`: `application/json`

Query Params:
None
Body:

```typescript
{
  alt: string;
}
```

#### Response

Headers:

- `Content-Type`: `application/json`

Body:

```typescript
{
  alt?: string;
}
```

Status:

- 200: Alt Text Updated Successfully
  - `alt` will reflect the updated alt text.
- 401: The authentication token was not provided or was invalid
  - `alt` will be undefined.
- 403: The user is not a contributor on the project or does not have the editor role.
  - `alt` will be undefined.
- 404: The requested project or image could not be found
  - `alt` will be undefined.
- 429: Rate Limit Exceeded.
- 500: Internal Server Error

### Remove Image `DELETE` `/api/v1/project/[project_id]/image/[image_id]`

Deletes an image from the file storage and disassociates it from the project. Can be called by all project contributors with the editor role.

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
{message: string} | undefined
```

Status:

- 204: Image deleted successfully
  - Body will be undefined
- 401: The session token is missing or invalid.
  - Body will be undefined
- 403: The user is not a contributor on the requested project or does not have the editor role.
  - Body will be undefined
- 404: Either the project or image requested does not exist.
  - Body message will contain either: "Project does not exist" or "Post does not exist"
- 429: Rate Limit Exceeded.
- 500: Internal Server Error
  - Body will be undefined

### Add Link `POST` `/api/v1/project/[project_id]/link`

Creates a new link associated with the project. Can be called by project collaborators with the editor role.

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
id: string;
} | undefined
```

Status:

- 201: Created Successfully
  - Body will be populated with relevant info.
- 401: The session token is missing or invalid.
  - Body will be undefined
- 403: The user is not a contributor on the requested project or does not have the editor role
  - Body will be undefined
- 404: The project does not exist
  - Body will be undefined
- 429: Rate Limit Exceeded.
- 500: Internal Server Error
  - Body will be undefined

### Update Link `PUT` `/api/v1/project/[project_id]/link/[link_id]`

Updates the link url and cover text, returning the new values. All project contributors with the editor role of the specified project should be able to call this endpoint.

#### Request

Headers:
`Content-Type`: `application/json`

Query Params:
None

Body:

```typescript
{
  url: string;
  coverText: string;
}
```

#### Response

Headers:

- `Content-Type`: `application/json`

Body:

```typescript
{
url: string;
coverText: string;
id: string;
} | string | undefined
```

Status:

- 200: Updated Successfully
  - Body will be populated with the updated link info.
- 401: The session token is missing or invalid.
  - Body will be undefined
- 403: The user is not a contributor on the requested project or does not have the editor role
  - Body will be undefined
- 404: Either the project or the link specified does not exist
  - Body will say either "Project does not exist" or "Link does not exist"
- 429: Rate Limit Exceeded.
- 500: Internal Server Error
  - Body will be undefined

### Delete Link `DELETE` `/api/v1/project/[project_id]/link/[link_id]`

Removes the specified link, and disassociates it from the project. All contributors with the editor role for the specified project should be able to call to this endpoint.

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
{ message: string } | undefined
```

Status:

- 200: Deleted Successfully
  - Body will be undefined
- 401: The session token is missing or invalid.
  - Body will be undefined
- 403: The user is not a contributor for the specified project or does not have the editor role.
  - Body will be undefined
- 404: The project or link could not be found.
  - Message will say "Project does not exist" or "Link does not exist"
- 429: Rate Limit Exceeded.
- 500: Internal Server Error
  - Body will be undefined

### Add Question `POST` `/api/v1/project/[project_id]/question`

Creates a new question associated with the project. Can be called by project collaborators with the editor role of the specified project.

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
id: string;
} | undefined
```

Status:

- 201: Created Successfully
  - Body will be populated with relevant info.
- 401: The session token is missing or invalid.
  - Body will be undefined
- 403: The user is not a contributor on the requested project or does not have the editor role.
  - Body will be undefined
- 404: The project does not exist
  - Body will be undefined
- 429: Rate Limit Exceeded.
- 500: Internal Server Error
  - Body will be undefined

### Update Question `PUT` `/api/v1/project/[project_id]/question/[question_id]`

Updates the prompt or response for a question beloning to a project. Can be called by all contributors to the specified project with the editor role.

#### Request

Headers:
None

Query Params:
None

Body:

```typescript
{
  url: string;
  coverText: string;
}
```

#### Response

Headers:

- `Content-Type`: `application/json`

Body:

```typescript
{
url: string;
coverText: string;
id: string;
} | string | undefined
```

Status:

- 200: Updated Successfully
  - Body will be populated with the updated link info.
- 401: The session token is missing or invalid.
  - Body will be undefined
- 403: The user is not a contributor on the requested project or does not have the editor role.
  - Body will be undefined
- 404: Either the project or the link specified does not exist
  - Body will say either "Project does not exist" or "Link does not exist"
- 429: Rate Limit Exceeded.
- 500: Internal Server Error
  - Body will be undefined

### Delete Question `DELETE` `/api/v1/project/[project_id]/question/[question_id]`

Removes the specified question prompt and response from the Database, and disassociates it from the project. All contributors with the editor role for the specified project should be able to call to this endpoint.

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
{ message: string } | undefined
```

Status:

- 200: Deleted Successfully
  - Body will be undefined
- 401: The session token is missing or invalid.
  - Body will be undefined
- 403: The user is not a contributor for the specified project or does not have the editor role.
  - Body will be undefined
- 404: The project or link could not be found.
  - Message will say "Project does not exist" or "Question does not exist"
- 429: Rate Limit Exceeded.
- 500: Internal Server Error
  - Body will be undefined

### Set Course / Group `PUT` `/api/v1/project/[project_id]/course`

Sets the course / group for the project. This can only be performed by the project owner.

#### Request

Headers
None

Query Params:
None

Body:

```typescript
{
  group: string;
}
```

#### Response

Headers

- `Content-Type`: `application/json`

Body:

```typescript
{
    group?: string
}
```

Status:

- 200: Group Updated Successfully
  - group value will reflect the new group
- 401: The authentication token was not provided or was invalid
  - group value will be undefined
- 403: The user is not the owner of the project
  - group value will be undefined
- 404: The requested project was not found
  - group value will be undefined
- 429: Rate Limit Exceeded.
- 500: Internal Server Error
  - group value will be undefined
