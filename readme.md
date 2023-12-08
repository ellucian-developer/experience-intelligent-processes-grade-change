# Experience Faculty Grade Change - Maestro Workflow

This extension facilitates a streamlined process for faculty members to formally request the registrar's intervention in grade adjustments for individual students.

It comprises code for a Experience Card and Page along with an associated Maestro workflow designed to facilitate grade changes by faculty members. 

- The Experience Card and Page enables faculty to specify the target course and desired grade adjustments, triggering the invocation of the Maestro workflow. 
- The Maestro workflow, in turn, executes the grade change process using the information provided by the faculty through the Experience Page.


> Kindly note that the Maestro-Experience extension is tailored exclusively for Banner only.

## Faculty Grade Change Form - Experience Card

The experience card features a straightforward hyperlink leading to the Grade Change Form.

<p align="center">
    <img src="./docs/images/card.png" width="400px"/>
</p>


## Faculty Grade Change Form - Experience Page

The Grade Change Form presents a comprehensive array of fields that users are required to complete in order to retrieve pertinent student information for initiating a grade change request.

Upon inputting the term code, the system dynamically populates all associated courses and their corresponding grades. Upon selection of a specific course, the form further populates with the details of all students enrolled in the chosen term and course. Subsequently, upon choosing a particular student, the form automatically populates their current grade, streamlining the process for users.

<p align="center">
    <img src="./docs/images/page-view.png" width="800px"/>
</p>

##### JSON Body

The following JSON body is what we'll be submitting to Maestro Workflow API ie, `workflow-instances` API. We have to configure the below mentioned API parameters under the `variables` key on Maestro Start section. 

Please refer the **Start Parameters** image under the Maestro Workflow section.

```JSON
    {
        "id": "f07c9938-69c0-46b1-8db7-dc029b7a204e", // workflow ID
        "variables": {
            "term": {
                "value": "201860"
            },
            "facultyID": {
                "value": "A00042621"
            },
            "facultyName": {
                "value": "Andrew"
            },
            "studentID": {
                "value": "A00037747"
            },
            "studentName": {
                "value": "Johnson, Bill"
            },
            "courseID": {
                "value": "2"
            },
            "courseName": {
                "value": "MATH"
            },
            "oldGrade": {
                "value": "D"
            },
            "newGrade": {
                "value": "A++"
            },
            "facultyComment": {
                "value": "Test"
            },
            "gradeId": {
                "value": "309ee8b1-40ea-41f9-842b-097c9c474955" // Internal Use
            },
            "studentGuid": {
                "value": "cac7d5a4-150f-4e06-b68f-e6c8c9fb8e70" // Internal Use
            },
            "academicPeriodId": {
                "value": "53d1f1d7-2535-4051-ad48-e021c5f9e1eb" // Internal Use
            },
            "gradeChangeCode": {
                "value": "89ce21f7-9cc3-4455-8c36-00556d3535bf" // Internal Use
            },
            "gradeRowId": {
                "value": "ed9863eb-1260-4e58-be22-1516fa1dad65" // Internal Use
            }
        }
    }
```

The fields which aren't marked as `Internal Use` would be shown to the registrar during grade change approval screen.



## Maestro Workflow

<p align="center">
    <img src="./docs/images/maestro.png" width="800px"/>
</p>

#### Start Parameters

Under the start section, we have configure all the above mentioned API variables under start parameters as follows.

<p align="center">
    <img src="./docs/images/start.png" width="800px"/>
</p>

## APIs

This extension necessitated the utilization of both BP APIs and EEDM APIs, as a straightforward solution was not readily available within either framework. The following is a compilation of the APIs employed in this context

- [academic-periods](https://resources.elluciancloud.com/bundle/banner_api_ethos_api_academic_periods_16.1.0/page/academic-periods.html)
- [class-attendance-roster](https://resources.elluciancloud.com/bundle/banner_api_business_api_class_attendance_roster_1.0.0/page/class-attendance-roster.html)
- [term-codes](https://resources.elluciancloud.com/bundle/banner_api_business_api_term_codes_1.0.0/page/term-codes.html) 
- [course-maintenance](https://resources.elluciancloud.com/bundle/banner_api_business_api_course_maintenance_1.1.0/page/course-maintenance.html) 
- [faculty-assignment](https://resources.elluciancloud.com/bundle/banner_api_business_api_faculty_assignment_1.0.0/page/faculty-assignment.html)
- [grade-change-reasons](https://resources.elluciancloud.com/bundle/banner_api_ethos_api_grade_change_reasons_6.0.0/page/grade-change-reasons.html)
- [grade-definitions](https://resources.elluciancloud.com/bundle/banner_api_ethos_api_grade_definitions_6.0.0/page/grade-definitions.html)
- [persons](https://resources.elluciancloud.com/bundle/banner_api_ethos_api_persons_12.6.0/page/persons.html)
- [student-transcript-grades](https://resources.elluciancloud.com/bundle/banner_api_ethos_api_student_transcript_grades_1.1.0/page/student-transcript-grades.html)
- [student-transcript-grades-adjustments](https://resources.elluciancloud.com/bundle/banner_api_ethos_api_student_transcript_grades_adjustments_1.0.0/page/student-transcript-grades-adjustments.html)
- [workflow-instances (Maestro Workflow API)](https://resources.elluciancloud.com/bundle/services_maestro_api_api_workflow_instances_1.0.0/page/workflow-instances.html)


### DataConnect Serverless APIs & Authorization

It is imperative to generate Dataconnect Serverless APIs for all previously specified APIs, excluding the `workflow-instances`. Specifically, the `student-transcript-grades-adjustments` API will utilize the `Ethos Token` Authentication type, while all other APIs will employ the `User Token` authentication method.

Kindly check the below documentation links for creating Serverless APIs and setting up authorizations permissions for the above mentioned authentication methods
- [DataConnect Serverless APIs](https://resources.elluciancloud.com/bundle/ethos_data_connect_int_design_acn_use/page/t_dc_designer_create_serverless_api.html)
- [Ethos Token](https://resources.elluciancloud.com/bundle/ethos_data_connect_int_design_acn_use/page/t_dc_designer_ethos_token_configuration.html)
- [User Token](https://resources.elluciancloud.com/bundle/ethos_data_connect_int_design_acn_use/page/t_dc_designer_user_token_configuration.html)

For the documentation on `workflow-instances`, kindly refer [here](https://resources.elluciancloud.com/bundle/services_maestro_api_api_workflow_instances_1.0.0/page/workflow-instances.html).

## Experience Page - Flow

The sequence of data flow is as follows

### Independent APIs

Below mentioned APIs are fired as soon as the page is loaded

| Endpoint    | Description |
| ------------------------------------------------------- | ------- |
| `term-codes`  | Retrieves the list of term codes available    |
| `grade-change-reasons`    | Retrieves the catalogue of reasons available for faculty members to designate when submitting a request for a grade change    |

### Dependent APIs

As soon as the faculty keys in the term code the following data flow gets invoked

| Endpoint    | Description | Dependent On | Data to Pick | Authentication Type |
| -------- | ------- |--------------|-------------------|-------------------|
| `faculty-assignment`  | Upon the faculty's input of the term code, this API will be utilized to retrieve a comprehensive list of all available Course Reference Numbers (CRNs) associated with the specified term.   | <ul><li>`term`</li></ul> | <ul><li>`crn`</li></ul> | User Token |
| `academic-periods`  | Hit this API to get the current academic period GUID with the selected term   | <ul><li>`term`</li></ul> | <ul><li>`id`</li></ul> |User Token |
| `class-attendance-roster`  | Given both the `term` and `CRN` parameters, it is necessary to query the `class-attendance-roster` API to gather information on all actively enrolled students.    | <ul><li>`term`</li><li>`crn`</li></ul> |<ul><li>`spridenId`</li><li>`spridenCurrName`</li></ul> |User Token |
| `course-maintenance`  | To retrieve the current grade of a user, invoke this API with the specified dependent data.   | <ul><li>`term`</li><li>`crn`</li><li>`studentBannerId`</li></ul> | <ul><li>`SHRTCKG[0].grdeCodeFinal`</li></ul> | User Token |
| `persons`  | In order to get the student's GUID, we have to invoke this API    | <ul><li>`studentBannerId`</li></ul> | <ul><li>`id`</li></ul> |User Token |
| `student-transcript-grades`  | To obtain the current grade of a student, utilize this API by providing the current academic period GUID and the student GUID as necessary parameters.    | <ul><li>`studentGUID`</li><li>`academicPeriodGUID`</li></ul> | <ul><li>`id`</li></ul> |User Token |

Upon acquiring all essential data for the Maestro workflow, proceed to invoke the `workflow-instances` Maestro API along with the workflow ID.


### Maestro Workflow Action

| DataConnect Serverless Endpoint    | Description | Required Params  | Authentication Type |
| -------- | ------- |--------------|--------------|
| `student-transcript-grades/{id}`  | When the registrar approves the grade change, then this API is invoked automatically via Maestro Action and updates the grade.   | <ul><li>`recordId`</li><li>`gradeId`</li><li>`changeReasonId`</li></ul> |Ethos Token |




## Path Design System

For this extension, we have leveraged the following Path Design components to create a clean and minimal UI.

- Grid
- DropdownTypehead
- Snackbar
- TextField
- Button

With Path Design System, you get to experience unparalleled cross-device compatibility, as this extension effortlessly adapts and shines with responsive design.

## Technologies

#### authenticatedEthosFetch

This extension makes use of the authenticatedEthosFetch function to call Banner Business Process APIs (BPAPIs) directly, without having to create and invoke a microservice that uses the Ethos API keys as an intermediary.

[Read more](https://resources.elluciancloud.com/bundle/ellucian_experience_acn_use/page/c_extension_bpapi_oauth.html)

#### Dataconnect Serverless APIs

As the Faculty Grade Change experience is exclusively accessible to users with the Faculty role, direct utilization of authenticatedEthosFetch is not feasible, given that the majority of APIs are restricted to the experience-admin role. Consequently, we have developed all aforementioned APIs on Data Connect as serverless APIs, with the exception of the `workflow-instances` API.

## Grids

With the Path Design system's grids, our UI seamlessly adapts to whichever screen the user is viewing and provides a flawless user experience.

<p align="center">
    <img src="./docs/images/portrait-view.png" width="200px"/>
</p>
<p align="center">
    <img src="./docs/images/landscape-view.png" width="400px"/>
</p>


Copyright 2021–2023 Ellucian Company L.P. and its affiliates.



