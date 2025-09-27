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

- `limit`: The number of projects to list, optional, default is 24. The maximum is 100.
- `token`: The pagination token for listing the next set of results.
- `keywords`: A list of strings that the description and title should contain. All returned projects will contain at least one keyword from this list. Default is the empty list. The maximum length for this list is 10 items.
- `skills`: A list of skills that were used on the project. All returned projects will have at least one of the skills listed. Default is the empty list. The maximum length for this list is 10 items.
- `groups`: Lists projects that are apart of the specified groups / courses. Default is the empty list. The maximum length for this list is 10 items.

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
            link: string,
            caption: string
        } | null
    }[];
    paginationToken?: string; // This will be the id of the item to start at.
} | string
```

Status:

- 200: Search Successful
  - The list will have at least one item. If there are more items than the limit, a pagination token will be provided, otherwise it will be undefined.
- 400: If there are too many keywords, majors, skill tags etc. (> 10 items in each category) or if the user specifies an invalid limit parameter
  - List will be empty and token will be undefined.
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
If this project is marked as draft, then this will return 403 for all users except the owner and collaborators.
If this project is marked as DELETED, then this will return 404 for all
users including the owner and collaborators.

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
        name: string,
        id: string,
    }[],
    images: {
        link: string,
        caption: string,
        id: string,
    }[],
    thumbnail: {
        link: string | undefined,
        caption: string | undefined,
        id: string | undefined
    },
    links: {
        link: string,
        coverText: string,
        id: string,
    }[],
    description: string,
    questions: {
        id: string,
        question: string,
        answer: string,
    }[],
    group: {
        id: string,
        name: string,
    }
    createdAt: string, // The creation date formatted in the ISO standard
    updatedAt: string, // The last updated date formatted in the ISO standard
    storageRemaining: number
  }
}
```

Status:

- 200: Project Fetched Successfully
  - project will be fully populated
- 404: The requested project was not found or the project was deleted
- 403: The user does not have permission to access this project
  - This will be returned if the project is marked as draft and the user is not the owner or a contributor.
- 429: Rate Limit Exceeded.
- 500: Internal Server Error

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

### Transfer Project Ownership `POST` `/api/v1/project/[project_id]/owner`

Transfers ownership of the project to the user specified. Can only be called by the owner of the project. If the new owner is not already a contributor they will be added with the EDITOR role. If the new owner is a contributor then we make sure they have the EDITOR role. Then we assign them as the owner of the project. Lastly we return the updated contributors list and owner info.

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
  - Body will be an error message
- 403: The caller is not the project owner.
  - Body will be an error message
- 404: The email of the new owner is not registered to a known user. Or the project was not found.
  - body will say either "New Owner Not Found" or "Project Not Found"
- 429: Rate Limit Exceeded.
- 500: Internal Server Error
  - Body will be an error message

### Set Project Visibility `PUT` `/api/v1/project/[project_id]/visibility`

Sets the project visibility. Only the owner of the project can call to this endpoint. This endpoint will likely change soon as we add moderation capabilities to the project.

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
    visibility: "PUBLIC" | "DRAFT"
} | string
```

Status:

- 200: Visibility Set Successfully
  - `visibility` will be set to the updated visibility value
- 400: If the specified visibility is not one of `PUBLIC` or `DRAFT`
  - Body will contain error message
- 401: The user's session token is not provided or invalid
  - Body will contain error message
- 403: The user is not the project owner.
  - Body will contain error message
- 404: The project requested was not found.
  - Body will contain error message
- 429: Rate Limit Exceeded.
  - Body will contain error message
- 500: Internal Server Error
  - Body will contain error message

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
- 400: If the title is longer than 100 characters
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

Adds a new empty contributor to the project. This can only be performed by the project owner. To assign a contributor a name and email, see the `Update Contributor` endpoint

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

Updates the name and email of the specified contributor. This can only be performed by the project owner. The contributor corresponding to the owner of the project cannot be updated. If the email for the contributor being
updated is registered as a user, their profile will be connected to the
project.

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
} | string
```

Status:

- 200: Title Updated Successfully
  - Name and email will be set to the new value
- 400: If the role specified is not either EDITOR or VIEWER, or you tried to update the info of the project owner.
  - Body will be an error message
- 401: The authentication token was not provided or was invalid
  - Body will be an error message
- 403: The user is not the owner of the project
  - Body will be an error message
- 404: The requested project was not found
  - Body will be an error message
- 429: Rate Limit Exceeded.
- 500: Internal Server Error
  - Body will be an error message

### Delete Contributor `DELETE` `/api/v1/project/[project_id]/contributor/[contributor_id]`

Removes a contributor from the project. This can only be performed by the project owner.
You cannot remove the owner of the project from the list of contributors.

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
string | undefined;
```

Status:

- 204: Contributor was removed successfully
  - Body is undefined
- 400: If you try to remove the owner of the project
  - Body is an error message
- 401: The authentication token was not provided or was invalid
  - Body is an error message
- 403: The user is not the owner of the project
  - Body is an error message
- 404: The requested project was not found
  - Body is an error message
- 429: Rate Limit Exceeded.
- 500: Internal Server Error
  - Body is an error message

### List All Existing Skill Tags `GET` `/api/v1/project/skill-tags/`

Lists all the existing skill tags. Can be called by any user.

**TODO: This should become a search endpoint, as with too many skill tags
this could become buggy.**

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
string;
```

Status:

- 200: Tag Added Successfully
  - body will be a success message
- 401: The authentication token was not provided or was invalid
  - body will be an error message
- 403: The user is not a contributor on the project or does not have the editor role.
  - body will be an error message
- 404: The requested project or skill tag was not found
  - message will either say "Project Not Found", or "Skill Tag Not Found"
- 429: Rate Limit Exceeded.
- 500: Internal Server Error
  - body will be an error message

### Remove Skill Tag from Project `DELETE` `/api/v1/project/[project_id]/skill-tag/[tag_id]`

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
string | undefined;
```

Status:

- 204: Tag Removed Successfully
  - Body will be undefined
- 401: The authentication token was not provided or was invalid
  - Body will be an error message
- 403: The user is not a contributor on the project or does not have the editor role.
  - Body will be an error message
- 404: The requested project or skill tag was not found on the project
  - message will either say "Project Not Found", or "Skill Tag Not Found On Project"
- 429: Rate Limit Exceeded.
- 500: Internal Server Error
  - message will be an error message

### Update Description `PUT` `/api/v1/project/[project_id]/description`

Changes the description of the project. This can only be called by collaborators on the project with the editor role. All description input provided to the API is HTML sanitized, and allows only the tags provided by the rich text editor.

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
    description:string
} | string
```

Status:

- 200: Description Updated Successfully
  - `description` will reflect the updated description.
- 401: The authentication token was not provided or was invalid
  - The body will be an error message.
- 403: The user is not a contributor on the project or does not have the editor role.
  - The body will be an error message.
- 404: The requested project could not be found
  - The body will be an error message.
- 429: Rate Limit Exceeded.
- 500: Internal Server Error
  - The body will be an error message.

### Serve Image `GET` `/api/v1/project/[project_id]/image/[image_id]`

Serves the specified image. Can be called by anyone. If the image
belongs to a draft project, only collaborators with the editor role
will have the ability to view the specified image.

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
- 404: Image was not found
- 403: The user does not have permission to access this image
  - This will be returned if the project is marked as draft and the user is not the owner or a contributor.
- 429: Rate Limit Exceeded.
- 500: Internal Server Error
  - Body will be an error message

### Add Thumbnail `POST` `/api/v1/project/[project_id]/thumbnail`

Uploads an image to the MinIO database and sets it as the project's thumbnail. Can be called by all project contributors with the editor role.

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
  id: string;
  link: string;
  alt: string;
  storageRemaining: number; // In bytes
} | string
```

Status:

- 201: Image Uploaded Successfully
  - All fields will be populated with relevant info.
- 400: Bad Request
  - If the Content-Type of this endpoint is not one of the above this will be returned.
  - If there are too few bytes remaining in the project's storage quota to upload this image.
  - Body is an error message
- 401: Unauthorized, the user's session token is missing or invalid
  - Body is an error message
- 403: The user is not a project contributor for the requested project or does not have the editor role.
  - Body is an error message
- 404: The requested project does not exist
  - Body is an error message
- 429: Rate Limit Exceeded.
  - Body is an error message
- 500: Internal Server Error
  - Body is an error message

### Update Thumbnail Alt Text `PUT` `/api/v1/project/[project_id]/thumbnail`

Updates the alt text for the project's thumbnail image. Can be called by all project contributors with the editor role.

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
  id: string;
  altText?: string;
  url: string;
} | string
```

Status:

- 200: Alt Text Updated Successfully
  - Body fields will be populated
- 401: The authentication token was not provided or was invalid
  - Body will be an error message
- 403: The user is not a contributor on the project or does not have the editor role.
  - Body will be an error message
- 404: The requested project or image could not be found
  - Body will be an error message
- 429: Rate Limit Exceeded.
- 500: Internal Server Error
  - Body will be an error message

### Remove Thumbnail `DELETE` `/api/v1/project/[project_id]/thumbnail`

Deletes the project's thumbnail image from the file storage and disassociates it from the project. Can be called by all project contributors with the editor role.

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
{storageRemaining: number} | string
```

Status:

- 200: Thumbnail deleted successfully
  - Body will contain the updated storage remaining amount.
- 401: The session token is missing or invalid.
  - Body will be an error message
- 403: The user is not a contributor on the requested project or does not have the editor role.
  - Body will be an error message
- 404: Either the project or image requested does not exist.
  - Body message will contain either: "Project does not exist" or "Post does not exist"
- 429: Rate Limit Exceeded.
- 500: Internal Server Error
  - Body will be an error message

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
  id: string;
  link: string;
  alt: string;
  storageRemaining: number; // In bytes
} | string
```

Status:

- 201: Image Uploaded Successfully
  - All fields will be populated with relevant info.
- 400: Bad Request
  - If the Content-Type of this endpoint is not one of the above this will be returned.
  - If there are too few bytes remaining in the project's storage quota to upload this image.
  - Body will be an error message.
- 401: Unauthorized, the user's session token is missing or invalid
  - Body will be an error message.
- 403: The user is not a project contributor for the requested project or does not have the editor role.
  - Body will be an error message.
- 404: The requested project does not exist
  - Body will be an error message.
- 429: Rate Limit Exceeded.
- 500: Internal Server Error
  - Body will be an error message.

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
  alt: string;
} | string
```

Status:

- 200: Alt Text Updated Successfully
  - `alt` will reflect the updated alt text.
- 401: The authentication token was not provided or was invalid
  - Body will be an error message
- 403: The user is not a contributor on the project or does not have the editor role.
  - Body will be an error message
- 404: The requested project or image could not be found
  - Body will be an error message
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
{storageRemaining: number} | string
```

Status:

- 204: Image deleted successfully
  - `storageRemaining` will contain the updated storage remaining amount.
- 401: The session token is missing or invalid.
  - Body will be an error message
- 403: The user is not a contributor on the requested project or does not have the editor role.
  - Body will be an error message
- 404: Either the project or image requested does not exist.
  - Body message will contain either: "Project does not exist" or "Post does not exist"
- 429: Rate Limit Exceeded.
- 500: Internal Server Error
  - Body will be an error message

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
url: "";
label: "";
} | string
```

Status:

- 201: Created Successfully
  - Body will be populated with relevant info.
- 401: The session token is missing or invalid.
  - Body will be an error message
- 403: The user is not a contributor on the requested project or does not have the editor role
  - Body will be an error message
- 404: The project does not exist
  - Body will be an error message
- 429: Rate Limit Exceeded.
- 500: Internal Server Error
  - Body will be an error message

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
url: string;
label: string;
id: string;
} | string | undefined
```

Status:

- 200: Updated Successfully
  - Body will be populated with the updated link info.
- 401: The session token is missing or invalid.
  - Body will be an error message
- 403: The user is not a contributor on the requested project or does not have the editor role
  - Body will be an error message
- 404: Either the project or the link specified does not exist
  - Body will say either "Project does not exist" or "Link does not exist"
- 429: Rate Limit Exceeded.
- 500: Internal Server Error
  - Body will be an error message

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
string | undefined;
```

Status:

- 200: Deleted Successfully
  - Body will be undefined
- 401: The session token is missing or invalid.
  - Body will be an error message
- 403: The user is not a contributor for the specified project or does not have the editor role.
  - Body will be an error message
- 404: The project or link could not be found.
  - Message will say "Project does not exist" or "Link does not exist"
- 429: Rate Limit Exceeded.
- 500: Internal Server Error
  - Body will be an error message

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
  - Body will be an error message
- 403: The user is not a contributor on the requested project or does not have the editor role.
  - Body will be an error message
- 404: The project does not exist
  - Body will be an error message
- 429: Rate Limit Exceeded.
- 500: Internal Server Error
  - Body will be an error message

### Update Question `PUT` `/api/v1/project/[project_id]/question/[question_id]`

Updates the prompt or response for a question belonging to a project. Can be called by all contributors to the specified project with the editor role. The answer string will be HTML sanitized removing all tags that are not:

```
[
"b",
"i",
"u",
"sup",
"sub",
"em",
"strong",
"p",
"ul",
"ol",
"li",
"pre",
"code",
]
```

#### Request

Headers:
None

Query Params:
None

Body:

```typescript
{
  prompt: string;
  answer: string;
}
```

#### Response

Headers:

- `Content-Type`: `application/json`

Body:

```typescript
{
  prompt: string;
  answer: string;
  id: string;
} | string
```

Status:

- 200: Updated Successfully
  - Body will be populated with the updated link info.
- 401: The session token is missing or invalid.
  - Body will be an error message
- 403: The user is not a contributor on the requested project or does not have the editor role.
  - Body will be an error message
- 404: Either the project or the link specified does not exist
  - Body will say either "Project does not exist" or "Link does not exist"
- 429: Rate Limit Exceeded.
- 500: Internal Server Error
  - Body will be an error message

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
string | undefined;
```

Status:

- 200: Deleted Successfully
  - Body will be undefined
- 401: The session token is missing or invalid.
  - Body will be an error message
- 403: The user is not a contributor for the specified project or does not have the editor role.
  - Body will be an error message
- 404: The project or link could not be found.
  - Message will say "Project does not exist" or "Question does not exist"
- 429: Rate Limit Exceeded.
- 500: Internal Server Error
  - Body will be an error message

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
  group_id: string;
}
```

#### Response

Headers

- `Content-Type`: `application/json`

Body:

```typescript
{
    group: {
        id: string,
        name:string
    }
} | string
```

Status:

- 200: Group Updated Successfully
  - group value will reflect the new group
- 401: The authentication token was not provided or was invalid
  - Body will be an error message
- 403: The user is not the owner of the project
  - Body will be an error message
- 404: The requested project was not found
  - Body will be an error message
- 429: Rate Limit Exceeded.
- 500: Internal Server Error
  - Body will be an error message
