/* eslint-disable max-depth */
// Copyright 2021-2023 Ellucian Company L.P. and its affiliates.

import log from 'loglevel';
const logger = log.getLogger('default');

export const resourceName = 'get-class-attendance-roster-maestro';

export async function fetchClassAttendanceRoster({ authenticatedEthosFetch, queryKeys, signal }) {
    const { cardId, cardPrefix, ssbsectTermCodet = '', ssbsectCrnt = '' } = queryKeys;
    try {
        const start = new Date();

        if (!ssbsectTermCodet || !ssbsectCrnt) {
            return {
                data: undefined
            }
        }

        const searchParameters = new URLSearchParams({
            cardId,
            cardPrefix,
            ssbsectTermCodet,
            ssbsectCrnt
        }).toString();

        const response = await authenticatedEthosFetch(`${resourceName}?${searchParameters}`, {
            headers: {
                Accept: 'application/vnd.hedtech.integration.v0.0.1+json'
            },
            signal
        });
        const allStudents = await response.json();
        const data = allStudents.filter(student => student.rolled === 'Y');
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
