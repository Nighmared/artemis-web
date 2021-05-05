import { Grid } from '@material-ui/core';
import SystemConfigurationComponent from '../../components/system-configuration/system-configuration';
import { autoLogout, shallMock } from '../../utils/token';
import 'codemirror/lib/codemirror.css';
import 'codemirror/theme/material.css';
import Head from 'next/head';
import React, { useState } from 'react';
import AuthHOC from '../../components/401-hoc/401-hoc';
import SystemModule from '../../components/system-module/system-module';
import { useGraphQl } from '../../utils/hooks/use-graphql';
import { setup } from '../../libs/csrf';

const SystemPage = (props) => {
  if (shallMock()) {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const { worker } = require('../../utils/mock-sw/browser');
    worker.start();
  }

  autoLogout(props);

  const user = props.user;

  const STATS_RES: any = useGraphQl('stats', {
    isLive: true,
    hasDateFilter: false,
    hasColumnFilter: false,
  });
  const STATS_DATA: any = STATS_RES?.data;
  let CONFIG_DATA: any = useGraphQl('config', {
    isLive: true,
    hasDateFilter: false,
    hasColumnFilter: false,
  });
  CONFIG_DATA = CONFIG_DATA?.data;

  const processes = STATS_DATA ? STATS_DATA.view_processes : null;

  const modules = processes
    ? processes.map((ps) => {
      return [
        ps['name'].charAt(0).toUpperCase() + ps['name'].slice(1),
        ps['running'],
      ];
    })
    : [];

  const states = {};
  const modulesList = [
    'riperistap',
    'bgpstreamlivetap',
    'exabgptap',
    'detection',
    'mitigation',
    'bgpstreamhisttap',
    'bgpstreamkafkatap',
  ];
  const modulesLabels = {
    riperistap: 'RIPE RIS Monitor',
    bgpstreamlivetap: 'BGPStream Live Monitor',
    bgpstreamkafkatap: 'BGPStream Kafka Monitor',
    bgpstreamhisttap: 'BGPStream Historical Monitor',
    exabgptap: 'ExaBGP Monitor',
    detection: 'Detection',
    mitigation: 'Mitigation',
  };

  modules.forEach((module) => (states[module[0].toString()] = module[1]));
  const [state, setState] = useState(states);
  const keys = Object.keys(state).filter((key) =>
    modulesList.includes(key.substring(0, key.indexOf('-')).toLowerCase())
  );
  const subModules = {};
  keys.forEach((key) => {
    const keyL = key.substring(0, key.indexOf('-')).toLowerCase();
    if (keyL in subModules) {
      subModules[keyL].push([key.toLowerCase(), state[key]]);
    } else {
      subModules[keyL] = [[key.toLowerCase(), state[key]]];
    }
  });

  keys.sort();

  if (modules.length !== 0 && keys.length === 0) setState(states);

  return (
    <>
      <Head>
        <title>ARTEMIS - System</title>
      </Head>
      <div id="page-container">
        {user && state && (
          <div id="content-wrap" style={{ paddingBottom: '5rem' }}>
            <div className="row">
              <div className="col-lg-1" />
              <div className="col-lg-10">
                <div className="row">
                  <div className="col-lg-8">
                    <h1 style={{ color: 'black' }}>System</h1>{' '}
                  </div>
                  <div className="col-lg-1"></div>
                </div>
                <hr style={{ backgroundColor: 'white' }} />
              </div>
            </div>
            <div className="row">
              <div className="col-lg-1" />
              <div className="col-lg-10">
                <Grid container spacing={3}>
                  {keys.map((module, i) => {
                    return (
                      <SystemModule
                        {...props}
                        key={i}
                        module={module}
                        subModules={subModules}
                        labels={modulesLabels}
                        state={state}
                        setState={setState}
                      />
                    );
                  })}
                </Grid>
              </div>
            </div>
            <SystemConfigurationComponent
              {...props}
              CONFIG_DATA={CONFIG_DATA}
            />
          </div>
        )}
      </div>
    </>
  );
};

export default AuthHOC(SystemPage, ['admin']);

export const getServerSideProps = setup(async (req, res, csrftoken) => {
  return { props: { _csrf: csrftoken } };
});
