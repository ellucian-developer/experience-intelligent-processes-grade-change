/* eslint-disable max-depth */
// Copyright 2021-2023 Ellucian Company L.P. and its affiliates.


import log from 'loglevel';
const logger = log.getLogger('default');


export const resourceName = process.env.PIPELINE_GET_SECTIONS;
export async function fetchSections({ authenticatedEthosFetch, queryKeys, signal }) {
    if (!process.env.PIPELINE_GET_SECTIONS) {
        const message = 'PIPELINE_GET_SECTIONS is not defined in environment!!!';
        console.error(message);
        throw new Error(message);
    }
    const { cardId, cardPrefix, instructorId = '', academicPeriodId = '' } = queryKeys;

    try {
        const start = new Date();

        if (!instructorId || !academicPeriodId) {
            return {
                data: undefined
            }
        }

        const searchParameters = new URLSearchParams({
            cardId,
            cardPrefix,
            instructorId,
            academicPeriodId
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

        if (Number(response.status) !== 200) {
            return {
                error: {
                    message: data?.message,
                    statusCode: response.status
                }
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
