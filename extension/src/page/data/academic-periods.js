/* eslint-disable max-depth */
// Copyright 2021-2023 Ellucian Company L.P. and its affiliates.


import log from 'loglevel';
const logger = log.getLogger('default');

export const resourceName = 'get-academic-periods-maestro';

export async function fetchAcademicPeriods({ authenticatedEthosFetch, queryKeys, signal }) {
    const { cardId, cardPrefix, code } = queryKeys;

    try {
        const start = new Date();

        if (!code) {
            return {
                data: undefined
            }
        }

        const searchParameters = new URLSearchParams({
            cardId,
            cardPrefix,
            code
        }).toString();

        const response = await authenticatedEthosFetch(`${resourceName}?${searchParameters}`, {
            headers: {
                Accept: 'application/vnd.hedtech.integration.v0.0.3+json'
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
