import { Graduation } from '@ellucian/ds-icons/lib';
import { Button, makeStyles } from '@ellucian/react-design-system/core';
import { colorCtaGreenBase, colorCtaGreenTint, spacing40, spacing80 } from '@ellucian/react-design-system/core/styles/tokens';
import React from 'react';
import { useIntl } from 'react-intl';
import { withIntl } from '../i18n/ReactIntlProviderWrapper';

const useStyles = makeStyles(() => ({
    card: {
        marginTop: 0,
        marginRight: spacing40,
        marginBottom: 0,
        marginLeft: spacing40,
        padding: `${spacing80} 0`,
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        flexDirection: 'column',
        height: '100%'
    },
    buttonSpacing: {
        marginTop: spacing40
    },
    iconBackground: {
        backgroundColor: colorCtaGreenTint,
        borderRadius: '100%',
        padding: spacing40,
        width: '80px',
        height: '80px',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        flexDirection: 'column',
        color: colorCtaGreenBase,
        marginBottom: spacing40
    }
}));

const ExperienceFacultyGradeChangeMaestroCard = () => {
    const classes = useStyles();
    const intl = useIntl();

    return (
        <div className={classes.card}>
            <div className={classes.iconBackground}>
                <Graduation style={{ width: '40px', height: '40px' }} />
            </div>
            <Button id="grade-correction-form-cta" color="primary" className={classes.buttonSpacing}>
                {intl.formatMessage({ id: 'card.name' })}
            </Button>
        </div>
    );
};

export default withIntl(ExperienceFacultyGradeChangeMaestroCard);