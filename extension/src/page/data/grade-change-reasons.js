/* eslint-disable max-depth */
// Copyright 2021-2023 Ellucian Company L.P. and its affiliates.


import log from 'loglevel';
const logger = log.getLogger('default');

export const resourceName = process.env.PIPELINE_GET_GRADE_CHANGE_REASONS;
export async function fetchGradeChangeReasons({ authenticatedEthosFetch, queryKeys, signal }) {
    if (!process.env.PIPELINE_GET_GRADE_CHANGE_REASONS) {
        const message = 'PIPELINE_GET_GRADE_CHANGE_REASONS is not defined in environment!!!';
        console.error(message);
        throw new Error(message);
    }
    const { cardId, cardPrefix } = queryKeys;

    try {
        const start = new Date();

        const searchParameters = new URLSearchParams({
            cardId,
            cardPrefix
        }).toString();

        const response = await authenticatedEthosFetch(`${resourceName}?${searchParameters}`, {
            headers: {
                Accept: 'application/json'
            },
            signal
        });
        const data = await response.json();
        const end = new Date();
        logger.debug(`fetch ${resourceName} time: ${end.getTime() - start.getTime()}`);

        if (data?.errors) {
            return {
                dataError: data.errors,
                data: []
            }
        }

        return {
            data
        };
    } catch (error) {
        logger.error('unable to fetch data: ', error);
        throw error;
    }
}
