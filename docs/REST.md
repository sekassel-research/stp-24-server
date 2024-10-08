# REST API

## Rate Limit

All API operations are rate limited.
You cannot send more than **${environment.rateLimit.limit}** HTTP requests
from the same IP address within **${environment.rateLimit.ttl}** seconds.
WebSockets are exempt from this.

## Error Handling

Many operations may produce some kind of error.
They are generally indicated by different HTTP status codes in the 4xx-5xx range.

Error responses typically don't use the same schema as success responses.
To avoid cluttering the endpoints, only the success schema is provided.
The error schema is one of the following:

* [`ValidationErrorResponse`](#model-ValidationErrorResponse) for validation-related Bad Request errors
* [`ErrorResponse`](#model-ErrorResponse) for every other type of error.

Keep in mind that `ErrorResponse` may or may not include the `message` property with additional details.

## Cleanup

The following resources will be deleted automatically under certain conditions.

| A... | Will be deleted after...                       | If...                             |
|------|------------------------------------------------|-----------------------------------|
| User | ${environment.cleanup.tempUserLifetimeHours} h | they seem to be for temporary use |
| Game | ${environment.cleanup.gameLifetimeHours} h     | -                                 |

## Cascading Deletes

The following table shows which delete operations trigger other deletes.
Cascading deletes are transitive, meaning a cascading deletion can trigger more cascading deletions.
All delete operations, whether manual, cleanup or cascading, trigger the same events.

| Deleting a... | Also deletes...                     |
|---------------|-------------------------------------|
| User          | Their Achievements                  |
| User          | Their Games                         |
| User          | Their Empires in Games              |
| User          | Their Memberships in Games          |
| User          | Their Friend Requests and Relations |
| Game          | All Empires                         |
| Game          | All Members                         |
| Game          | All Systems                         |
| Game          | All Jobs                            |
| Game          | All Fleets                          |
| Game          | All Wars                            |
| Empire        | All Fleets owned by the Empire      |
| Empire        | All Jobs started by the Empire      |
| Empire        | All Wars related to the Empire      |
| Fleet         | All Ships within the Fleet          |
| Fleet         | All `travel` Jobs                   |
