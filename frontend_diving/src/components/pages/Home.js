import React from "react";
import {useTranslation, withTranslation} from 'react-i18next';


class Home extends React.Component {
    render() {
        const { t } = this.props;
        return(
            <iframe
                title="Static HTML"
                src="/aboutUs.html"
                width="100%"
                height="100%"
                style={{ border: "none" }}
            />
        )
    }
}
export default  withTranslation()(Home);