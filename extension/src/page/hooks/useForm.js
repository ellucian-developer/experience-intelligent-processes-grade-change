import { useMemo, useState } from 'react';

import { useData } from '@ellucian/experience-extension-utils';
import { useCardInfo } from '@ellucian/experience-extension/extension-utilities';

const useForm = (
    initialValue,
    validationRules = []
) => {
    const [value, setValue] = useState(initialValue);
    const [errors, setErrors] = useState(initialValue);
    const { authenticatedEthosFetch } = useData();
    const { configuration, cardConfiguration } = useCardInfo();
    const { maestroWorkflowId } = configuration || cardConfiguration || {};

    const setData = (newValue) => {
        setValue(value => ({
            ...value,
            ...newValue
        }))
    };

    const isDirty = useMemo(() => {
        return JSON.stringify(value) !== JSON.stringify(initialValue);
    }, [value, initialValue]);

    const post = async (url) => {
        const validation = validationRules.filter(field => !value[field].length);
        if (validation.length) {
            const tempErrors = {};
            for (let i = 0; i < validation.length; i++) {
                tempErrors[validation[i]] = 'Field is required'
            }
            setErrors(tempErrors)
            return null;
        }
        setErrors(initialValue)

        const payload = {
            id: maestroWorkflowId,
            requestedFor: value.registrarID,
            variables: {}
        }
        for (const item in value) {
            if (item in value) {
                payload.variables[item] = {
                    value: value[item]
                }
            }
        }

        const args = {
            options: {
                method: 'POST',
                headers: {
                    Accept: 'application/vnd.hedtech.integration.v1+json',
                    'Content-Type': 'application/vnd.hedtech.integration.v1+json'
                },
                body: JSON.stringify(payload)
            },
            resource: url
        }

        try {
            const response = await authenticatedEthosFetch(`${args.resource}`, args.options)
            if (response.status === 200) {
                reset();
                return true;
            }
        } catch (exception) {
            console.error(exception);
        }

        return false
    }

    const reset = () => {
        setValue(initialValue);
    }

    const formValue = useMemo(() => {
        return {
            data: value,
            setData,
            isDirty,
            post,
            reset,
            errors,
            setErrors
        };
    }, [value, isDirty, post, reset, errors, setErrors]);

    return formValue;
}

export default useForm;