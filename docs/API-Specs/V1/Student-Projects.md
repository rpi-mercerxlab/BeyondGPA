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

## API Endpoints


### Project Search `GET` `/api/v1/project`

Lists all projects with the `public` visibility that meet the specified criteria. All users can call to this endpoint. Users can filter by keywords, the majors of the contributors, the skills demonstrated on the project, or the group / course they worked on this project with. Items within the same field have an OR relationship, while each field will have an AND relationship. If a field is empty, then it is excluded from the filter

For example, the query:
`keywords`: ["Rocket", "Spaceflight"]
`majors`: ["Mechanical Engineering", "Computer Engineering"]
`skills`: ["CAD", "FEA"]
`groups`: []

Will return all projects that have "Rocket" OR "Spaceflight" OR Both in their title or description, AND
have at least one contributor majoring in "Mechanical Engineering" OR "Computer Engineering", AND
have at least either "FEA" OR "CAD" specified as one of the skills, AND
is made as a part of any group.

#### Request

Headers:
None

Query Params:
- `limit`: The number of projects to list, optional, default is 24.
- `keywords`: A list of strings that the description and title should contain. All returned projects will contain at least one keyword from this list. Default is the empty list.
- `majors`: A list of majors that the owner and collaborator should have. All returned projects will contain at least one contributor with at least one of the specified majors.
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
        contributors: string[],
        skillTags: string[],
        group: string,
        coverImage: {
            link: string,
            caption: string
        }
    }[]
}
```


Status:

- 200: Search Successful
  - The list will have at least one item.
- 404: There were no projects found that satisfied all of the requested properties.
  - List will be empty.
- 500: Internal Server Error
  - List will be empty.

### Project Creation: `POST` `/api/v1/project/`

This project allows a user with a student role to create an empty student project. Only authenticated users with a
student designation can create a project. The user that creates this project will be classified as the project owner.
This project will be defined with draft visibility, so its only visible to owner and contributors.

#### Request

Headers

- `Authorization`: The session token for the user trying to create the post.

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

- Status 201: Created
  - Project was created successfully
  - project_id will be the UUID for the project
- Status 401: Unauthorized
  - Returned if the Authorization header is blank or undefined. (The user is not logged in)
  - Could also be returned if the auth header is invalid, like the user tried to mess with their token.
  - project_id will be undefined
- Status 403: Forbidden
  - Returned if the user trying to create the project is not a student.
  - project_id will be undefined
- Status 500: Server Error
  - An internal server error occurred.
  - project_id will be undefined

### Full Project Read: `GET` `/api/v1/project/[project_id]`

Returns the all the information for a project. All users are allowed to call to this endpoint.
If this project is marked as draft, then this will return 404 for all users except the owner and collaborator.

#### Request

Headers

- `Authorization`: The session token for the user trying to read the post. This is optional.

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
  project_id?: {
    project_id: string,
    title: string,
    contributors: {
        name: string,
        email: string,
        major?: string,
    }[],
    skill_tags: {
        tag: string,
        id: string,
    }[],
    images: {
        link: string,
        caption: string
    }[],
    links: {
        link: string,
        coverText: string,
    }[],
    description: string,
    questions: {
        id: string,
        questionText: string,
        answerText: string,
    }[],
    group: {
        group: string,
        id: string
    },
  }
}
```

Status:

- 200: Project Fetched Successfully
  - project will be fully populated
- 404: The requested project was not found or the user did not have permission to access it
  - project will be undefined
- 500: Internal Server Error
  - project will be undefined

### Project Delete: `DELETE` `/api/v1/project/[project_id]`

Deletes the specified project. This can only be performed by the project owner.

#### Request

Headers

- `Authorization`: The session token for the user trying to delete the project.

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
- 500: Internal Server Error

### Set Project Visibility `PUT` `/api/v1/project/[project_id]/visibility`

Sets the project visibility. Only the owner of the project can call to this endpoint.

#### Request

Headers:

- `Authorization`: The session token for the user.

Query Params:
None

Body:

```typescript
{
  visibility: "public" | "draft";
}
```

#### Response

Headers:

- `Content-Type`: `application/json`

Body:

```typescript
{
    visibility?: "public" | "draft"
}
```

Status:

- 200: Visibility Set Successfully
  - `visibility` will be set to the updated visibility value
- 400: Description
  - `visibility` will be undefined
- 401: Description
  - `visibility` will be undefined
- 403: Description
  - `visibility` will be undefined
- 500: Description
  - `visibility` will be undefined

### Set Project Title `PUT` `/api/v1/project/[project_id]/title`

Sets the title for the project. This can only be performed by the project owner.

#### Request

Headers

- `Authorization`: The session token for the user trying to update the project title.

Query Params:
None

Body:

```typescript
{
  newTitle: string;
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
- 401: The authentication token was not provided or was invalid
  - title value will be undefined
- 403: The user is not the owner of the project
  - title value will be undefined
- 404: The requested project was not found
  - title value will be undefined
- 500: Internal Server Error
  - title value will be undefined

### Add Contributor `POST` `/api/v1/project/[project_id]/contributor`

Adds a new contributor to the project. This can only be performed by the project owner.

#### Request

Headers

- `Authorization`: The session token for the user trying to add the contributor.

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
- 500: Internal Server Error

### Update Contributor `PUT` `/api/v1/project/[project_id]/contributor/[contributor_id]`

Updates the name and email of the specified contributor. This can only be performed by the project owner.

#### Request

Headers

- `Authorization`: The session token for the user trying to update the project title.

Query Params:
None

Body:

```typescript
{
    name: string,
    email: string
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
    id: string
} | undefined
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
- 500: Internal Server Error
  - Body will be undefined

### Delete Contributor `DELETE` `/api/v1/project/[project_id]/contributor/[contributor_id]`

Removes a contributor from the project. This can only be performed by the project owner.

#### Request

Headers

- `Authorization`: The session token for the user trying to update the project title.

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
- 500: Internal Server Error
  - tags will be undefined

### Create New Skill Tag `POST` `/api/v1/project/skill-tags/`

Creates a new skill tag on the database. This can only be called by students.

#### Request

Headers

- `Authorization`: The session token for the user trying to create the skill tag.

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
    tag?:{
        tag_id: string,
        skill: string,
    }
}
```

Status:

- 200: Tag Added Successfully
  - tags will be populated with all the existing tags.
- 401: The authentication token was not provided or was invalid
  - tags will be undefined
- 403: The user is not a student
  - tags will be undefined
- 500: Internal Server Error
  - tags will be undefined

### Add Skill Tag to Project `POST` `/api/v1/project/[project_id]/skill-tag/[tag_id]`

Adds a reference to a skill tag to the specified post. This can only be called by collaborators on the project.

#### Request

Headers

- `Authorization`: The session token for the user trying to add the skill tag.

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
    message?: string
}
```

Status:

- 200: Tag Added Successfully
  - message will say "OK"
- 401: The authentication token was not provided or was invalid
  - message will be undefined
- 403: The user is not a contributor on the project
  - message will be undefined
- 404: The requested project or skill tag was not found
  - message will either say "Project Not Found", or "Skill Tag Not Found"
- 500: Internal Server Error
  - message will be undefined

### Remove Skill Tag `DELETE` `/api/v1/project/[project_id]/skill-tag/[tag_id]`

Removes a reference to a skill tag to the specified post. This can only be called by collaborators on the project.

#### Request

Headers

- `Authorization`: The session token for the user trying to add the skill tag.

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

- 200: Tag Removed Successfully
  - Body will be undefined
- 401: The authentication token was not provided or was invalid
  - Body will be undefined
- 403: The user is not a contributor on the project
  - Body will be undefined
- 404: The requested project or skill tag was not found on the project
  - message will either say "Project Not Found", or "Skill Tag Not Found On Project"
- 500: Internal Server Error
  - message will be undefined

### Update Description `PUT` `/api/v1/project/[project_id]/description`

Changes the description of the project. This can only be called by collaborators on the project.

#### Request

Headers

- `Authorization`: The session token for the user trying to update the description.

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
- 403: The user is not a contributor on the project
  - `description` will be undefined.
- 404: The requested project could not be found
  - `description` will be undefined.
- 500: Internal Server Error
  - `description` will be undefined.

### Serve Image `GET` `/api/v1/project/[project_id]/image/[image_id]`

Serves the specified image. Can be called by anyone. If the `Authorization` header is not provided
then any images for projects with `draft` visibility will return 404.

#### Request

Headers:

- `Authorization`: The session token for the user. (Optional)

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
- 404: Image was not found or the specified user did not have visibility rights to this post.
  - Body will be undefined
- 500: Internal Server Error
  - Body will be undefined

### Add Image `POST` `/api/v1/project/[project_id]/image`

Uploads an image to the MinIO database and links it to this project. Can be called by all project contributors.

#### Request

Headers:

- `Authorization`: The session token for the user.
- `Content-Type`: 
  - `image/png` for Portable Network Graphics images.
  - `image/jpeg` for Joint Photographic Experts Group images.
  - `image/gif` for Graphics Interchange Format images.
  - `image/svg+xml` for Scalable Vector Graphics images.
  - `image/webp` for WebP images.
  - `image/x-icon` for ICO (icon) files.
- `Content-Length`: The size of the image in bytes

Query Params:
None

Body:
The file object of the image being uploaded.

#### Response

Headers:
None

Body:
None

Status:

- 201: Image Uploaded Successfully
- 400: Bad Request
  - If the Content-Type of this endpoint is not one of the above this will be returned.
- 401: Unauthorized, the user's session token is missing or invalid
- 403: The user is not a project contributor for the requested project
- 404: The requested project does not exist
- 500: Internal Server Error

### Remove Image `DELETE` `/api/v1/project/[project_id]/image/[image_id]`

Deletes an image from the file storage and disassociates it from the project. Can be called by all project contributors.

#### Request

Headers:

- `Authorization`: The session token for the user.

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
- 403: The user is not a contributor on the requested project
  - Body will be undefined
- 404: Either the project or image requested does not exist.
    - Body message will contain either: "Project does not exist" or "Post does not exist"
- 500: Internal Server Error
  - Body will be undefined

### Add Link `POST` `/api/v1/project/[project_id]/link`

Creates a new link associated with the project. Can be called by project collaborators.

#### Request

Headers:

- `Authorization`: The session token for the user.

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
- 403: The user is not a contributor on the requested project
  - Body will be undefined
- 404: The project does not exist
  - Body will be undefined
- 500: Internal Server Error
  - Body will be undefined

### Update Link `PUT` `/api/v1/project/[project_id]/link/[link_id]`

Updates the link url and cover text, returning the new values. All project contributors of the specified project should be able to call this endpoint.

#### Request

Headers:

- `Authorization`: The session token for the user.

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
- 403: The user is not a contributor on the requested project
  - Body will be undefined
- 404: Either the project or the link specified does not exist
  - Body will say either "Project does not exist" or "Link does not exist"
- 500: Internal Server Error
  - Body will be undefined

### Delete Link `DELETE` `/api/v1/project/[project_id]/link/[link_id]`

Removes the specified link, and disassociates it from the project. All contributors for the specified project should be able to call to this endpoint.

#### Request

Headers:

- `Authorization`: The session token for the user.

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
- 403: The user is not a contributor for the specified project.
  - Body will be undefined
- 404: The project or link could not be found.
  - Message will say "Project does not exist" or "Link does not exist"
- 500: Internal Server Error
  - Body will be undefined

### Add Question `POST` `/api/v1/project/[project_id]/question`

Creates a new question associated with the project. Can be called by project collaborators of the specified project.

#### Request

Headers:

- `Authorization`: The session token for the user.

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
- 403: The user is not a contributor on the requested project
  - Body will be undefined
- 404: The project does not exist
  - Body will be undefined
- 500: Internal Server Error
  - Body will be undefined

### Update Question `PUT` `/api/v1/project/[project_id]/question/[question_id]`

Updates the prompt or response for a question beloning to a project. Can be called by all contributors to the specified project.

#### Request

Headers:

- `Authorization`: The session token for the user.

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
- 403: The user is not a contributor on the requested project
  - Body will be undefined
- 404: Either the project or the link specified does not exist
  - Body will say either "Project does not exist" or "Link does not exist"
- 500: Internal Server Error
  - Body will be undefined

### Delete Question `DELETE` `/api/v1/project/[project_id]/question/[question_id]`

Removes the specified question prompt and response from the Database, and disassociates it from the project. All contributors for the specified project should be able to call to this endpoint.

#### Request

Headers:

- `Authorization`: The session token for the user.

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
- 403: The user is not a contributor for the specified project.
  - Body will be undefined
- 404: The project or link could not be found.
  - Message will say "Project does not exist" or "Question does not exist"
- 500: Internal Server Error
  - Body will be undefined

### Set Course / Group `PUT` `/api/v1/project/[project_id]/course`

Sets the course / group for the project. This can only be performed by the project owner.

#### Request

Headers

- `Authorization`: The session token for the user trying to update the project title.

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
- 500: Internal Server Error
  - group value will be undefined
