# Firestore Database Schema

## Document Structure

```text
/site/about
/skills/{skillId}
/experience/{experienceId}
/projects/{projectId}
/blogs/{blogId}
```

## `/site/about`

```text
displayName: string
handle: string
headline: string
shortBio: string
longBio: string
location: string
timezone: string
availability: { status: string, label: string }
email: string
avatarUrl: string
socialLinks: { label: string, url: string }[]
interests: string[]
currentlyWorkingOn: string
resumeUrl: string
updatedAt: Timestamp
```

## `/skills/{skillId}`

```text
slug: string
name: string
category: string
summary: string
tools: string[]
featured: boolean
status: "published" | "draft"
order: number
createdAt: Timestamp
updatedAt: Timestamp
```

## `/experience/{experienceId}`

```text
slug: string
role: string
company: string
companyUrl: string
location: string
startDate: string       // YYYY-MM
endDate: string | null  // YYYY-MM
summary: string
highlights: string[]
tags: string[]
status: "published" | "draft"
order: number
createdAt: Timestamp
updatedAt: Timestamp
```

## `/projects/{projectId}`

```text
slug: string
title: string
summary: string
content: string         // Markdown
role: string
tags: string[]
links: string[]
imageUrl: string
featured: boolean
status: "published" | "draft"
order: number
createdAt: Timestamp
updatedAt: Timestamp
```

## `/blogs/{blogId}`

```text
slug: string
title: string
excerpt: string
content: string
tags: string[]
isTech: boolean
readingTimeMinutes: number
coverImageUrl: string
publishedAt: Timestamp
status: "published" | "draft"
order: number
seo: {
  title: string
  description: string
}
createdAt: Timestamp
updatedAt: Timestamp
```

## Current Document IDs

```text
skills:
  frontend-engineering
  backend-databases
  programming
  business-analysis

experience:
  atomnik-technologies
  malhar-26

projects:
  cosmikerp
  prayog
  swar
  the-laughing-hippo
  database-cache

blogs:
  om-namah-shivay
```

All timestamps are Firestore `Timestamp` values generated with
`FieldValue.serverTimestamp()` by the seed script.
