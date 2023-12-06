module.exports = {
    "name": "ExperienceFacultyGradeChangeMaestro",
    "publisher": "Ellucian",
    "cards": [{
        "type": "ExperienceFacultyGradeChangeMaestroCard",
        "source": "./src/cards/ExperienceFacultyGradeChangeMaestroCard",
        "title": "Faculty Grade Change",
        "displayCardType": "Faculty Grade Change",
        "description": "This is an introductory card to the Ellucian Experience SDK",
        configuration: {
            client: [
                {
                    key: 'maestroWorkflowId',
                    label: 'Maestro Workflow ID',
                    type: 'text',
                    required: true
                }
            ],
            server: [{
                key: 'ethosApiKey',
                label: 'Ethos API Key',
                type: 'password',
                require: true
            }]
        },
        "pageRoute": {
            "route": "/",
            "excludeClickSelectors": ['a']
        }
    }],
    "page": {
        "source": "./src/page/router.jsx"
    }
}