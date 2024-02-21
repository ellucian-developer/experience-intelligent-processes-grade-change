/* eslint-disable max-depth */
// Copyright 2021-2023 Ellucian Company L.P. and its affiliates.
import log from 'loglevel';
const logger = log.getLogger('default');


export const resourceName = process.env.PIPELINE_GET_PERSONS_INFO;
export async function fetchPersonInformation({ authenticatedEthosFetch, queryKeys, signal }) {
    if (!process.env.PIPELINE_GET_PERSONS_INFO) {
        const message = 'PIPELINE_GET_PERSONS_INFO is not defined in environment!!!';
        console.error(message);
        throw new Error(message);
    }
    const { cardId, cardPrefix, bannerIds = [] } = queryKeys;

    try {
        const start = new Date();

        if (!bannerIds.length) {
            return {
                data: undefined
            }
        }

        const fetchPromises = [];
        for (let i = 0; i < bannerIds.length; i++) {
            const searchParameters = new URLSearchParams({
                cardId,
                cardPrefix,
                id: bannerIds[i]
            }).toString();

            fetchPromises.push(authenticatedEthosFetch(`${resourceName}?${searchParameters}`, {
                headers: {
                    Accept: 'application/vnd.hedtech.integration.v0.0.1+json'
                },
                signal
            }));
        }

        const responses = await Promise.all(fetchPromises);

        const jsonPromises = [];
        for (const response of responses) {
            if (response.status === 200) {
                jsonPromises.push(response.json());
            }
        }

        if (!jsonPromises.length) {
            return {
                data: undefined
            }
        }

        const finalResponse = await Promise.all(jsonPromises);
        const data = finalResponse.map(item => item[0]);

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
