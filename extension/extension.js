module.exports = {
    "name": "Experience Faculty Grade Change Maestro",
    "publisher": "Ellucian",
    "cards": [{
        "type": "Experience Faculty Grade Change Maestro",
        "source": "./src/cards/ExperienceFacultyGradeChangeMaestroCard",
        "title": "Faculty Grade Change",
        "displayCardType": "Faculty Grade Change",
        "description": "This card helps faculty to change their student grade",
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