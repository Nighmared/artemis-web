import React, { useEffect, useState } from 'react';
import Media from 'react-media'
import AuthHOC from '../components/401-hoc/401-hoc';
import { setup } from '../libs/csrf'
import Head from 'next/head'
import {
    autoLogout,
    GLOBAL_MEDIA_QUERIES
} from "../utils/token"
import { ToastContainer } from 'react-toastify';





// const STATS_URI = "/get_stats"
// function get_stats() {
//     fetch('/api/auth/jwt').then(res => accessToken = res.json()).then(accessToken = accessToken.accessToken).then(res => token_callback());
// }


// function token_callback() {
//     const requestOptions = {
//         method: "GET",
//         headers: { "secret": accessToken }
//     }
//     fetch(STATS_URI, requestOptions).then(response => stats_callback(response))
// }
// function stats_callback(stats) {
//     const res = stats.json()
//     bitcoin_num_hijacked = res.bitcoin.hijacked_ips.length
//     bitcoin_total_nodes = res.bitcoin.total_nodes
//     ready = true
// }


function get_stats(token) {
    const requestOptions = {
        "headers": { "secret": token }
    }
    const req = fetch(`https://${window.location.hostname}:${window.location.port}/get_stats`, requestOptions)
    return req
}




const DistrStatsPage = (props: any) => {

    const [ready, setReady] = useState(false);
    const [bitcoinNumHijacked, setBitcoinNumHijacked] = useState(0);
    const [bitcoinTotalNodes, setBitcoinTotalNodes] = useState(0);

    function handle_stats(resultjson) {
        setBitcoinNumHijacked(resultjson.bitcoin.hijacked_ips.length);
        setBitcoinTotalNodes(resultjson.bitcoin.total_nodes);
        setReady(true);
    }

    useEffect(() => {
        fetch(`https://${window.location.hostname}:${window.location.port}/api/auth/jwt`)
            .then(res => res.json())
            .then(r => r.accessToken)
            .then(t => get_stats(t))
            .then(res => res.json())
            .then(r => handle_stats(r))
    }, []);

    useEffect(() => {
        autoLogout(props);
    }, [props]);

    const user = props.user



    return (
        <>
            <Head>
                <title>ARTEMIS - Distributed System Stats</title>
            </Head>
            {user && ready &&
                (<Media queries={GLOBAL_MEDIA_QUERIES}>
                    {(matches) => (
                        <div className="container overview col-lg-12">
                            <div className="row">
                                <div className="col-lg-1" />
                                <div className="col-lg-10">
                                    <div className="row">
                                        <div className="col-lg-9">
                                            <h1 style={{ color: 'black' }}>Distributed Hijack Stats</h1>
                                        </div>
                                    </div>
                                    <hr />
                                </div>
                            </div>
                            <div className="row">
                                <div className="col-lg-1" />
                                <div className="col-lg-10">
                                    <div className="card">
                                        <div className="card-header" style={{ backgroundColor: "white" }}>
                                            <div className="row">
                                                <h2> Bitcoin</h2>
                                            </div>
                                        </div>
                                        <div className="card-body">
                                            <div className="row">
                                                <div className="col-lg-2" />
                                                <div className="col-lg-10">
                                                    <p>
                                                        Currently {bitcoinNumHijacked} out of {bitcoinTotalNodes} Bitcoin Nodes<br />
                                                        are potentially being hijacked.
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <ToastContainer />
                        </div>
                    )}
                </Media>
                )
            }
        </>
    );
}

export default AuthHOC(DistrStatsPage, ["admin", "user"]);


export const getServerSideProps = setup(async (req, res, csrftoken) => {
    return {
        props: {
            _csrf: csrftoken,
            isTesting: process.env.TESTING === 'true',
            _inactivity_timeout: process.env.INACTIVITY_TIMEOUT,
            system_version: process.env.SYSTEM_VERSION,
        },
    };
});