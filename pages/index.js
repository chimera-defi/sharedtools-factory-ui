/******************************************************************************
**	@Author:				The Ape Community
**	@Twitter:				@ape_tax
**	@Date:					Wednesday August 11th 2021
**	@Filename:				index.js
******************************************************************************/

import React, {useState, useEffect, useRef, useCallback, useLayoutEffect} from 'react';
import Link from 'next/link';
import useSWR from 'swr';
import {ethers} from 'ethers';
import useWeb3 from 'contexts/useWeb3';
import {formatAmount} from 'utils';
import vaults from 'utils/vaults.json';
import chains from 'utils/chains.json';
import factories_mainnet from 'utils/factories_mainnet.json';
import factories_rinkeby from 'utils/factories_rinkeby.json';
import factories_goerli from 'utils/factories_goerli.json';
import factories_metis from 'utils/factories_metis.json';
import factories_matic from 'utils/factories_matic.json';

import user_interfaces_metis from 'utils/user_interfaces_metis.json';
import user_interfaces_rinkeby from 'utils/user_interfaces_rinkeby.json';
import user_interfaces_matic from 'utils/user_interfaces_matic.json';


import * as abis from 'utils/ABIs.js';
import GraphemeSplitter from 'grapheme-splitter';

const splitter = new GraphemeSplitter();
const sortBy = (arr, k) => arr.concat().sort((a, b) => (a[k] > b[k]) ? 1 : ((a[k] < b[k]) ? -1 : 0));
const fetcher = (...args) => fetch(...args).then(res => res.json());


function Index() {
	const {provider, active, address, chainID} = useWeb3();
	const [, set_nonce] = useState(0);
	const [factories, set_factories] = useState({});

	const [userInterfaces, set_userInterfaces] = useState({});
	const [UIsActive, set_UIsActive] = useState([]);

	const [factoriesActive, set_factoriesActive] = useState([]);
	const [activeFactory, set_activeFactory] = useState('');
	const autoUIRef = useRef();

	function createPayloadForAutoUI(name) {
		let obj = factories[name];
		if (!obj) obj = userInterfaces[name];
		let abi = abis[name];
		let addr = obj?.ADDR;
		return [{
			name: name,
			address: addr,
			abi: abi
		}];
	}
	function setAutoUI() {
		let data = createPayloadForAutoUI(activeFactory);
		let {node, cb} = window.displayContractUI(data);
		if (autoUIRef.current.firstChild) {
			autoUIRef.current.replaceChild(node, autoUIRef.current.firstChild);
		} else {
			autoUIRef.current.appendChild(node);
		}

		cb();
	}

	useEffect(() => {
		if (chainID == 1) set_factories(factories_mainnet);
		if (chainID == 4) {
			set_factories(factories_rinkeby);
			set_userInterfaces(user_interfaces_rinkeby);
		}
		if (chainID == 5) set_factories(factories_goerli);
		if (chainID == 435) {
			set_factories(factories_metis);
			set_userInterfaces(user_interfaces_metis);
		}
		if (chainID == 137) {
			set_factories(factories_matic);
			set_userInterfaces(user_interfaces_matic);
		}
	}, [chainID]);

	useEffect(() => {
		if (!active) return;
		if (!autoUIRef.current) return;
		if (!window.displayContractUI) return;
		if (activeFactory.length == 0) return;

		setAutoUI();
	}, [activeFactory]);

	useEffect(() => {
		if (!active) return;
		if (!autoUIRef.current) return;

		const script = document.createElement('script');
		script.src = '/smartcontract-app.js';
		script.async = true;

		let scriptLoaded = function () {
			if (!autoUIRef.current) return;
			set_activeFactory('VoteEscrowFactory');
		};
		script.onload = () => scriptLoaded();
		document.body.appendChild(script);

		return () => {
			document.body.removeChild(script);
		};
	}, [chainID, active]);


	useEffect(() => {
		if (!active) {
			return;
		}

		const _uis = [];
		Object.entries(userInterfaces).reverse().map(([key, vault]) => {
			if (vault.CHAIN_ID != chainID && !(vault.CHAIN_ID == 1 && chainID == 1337)) {
				return;
			}
			_uis.push(vault);
		});
		set_UIsActive(sortBy(_uis, 'TITLE'));


		const _factories = [];

		Object.entries(factories).reverse().map(([key, vault]) => {
			if (vault.CHAIN_ID != chainID && !(vault.CHAIN_ID == 1 && chainID == 1337)) {
				return;
			}

			vault.VAULT_SLUG = key;
			_factories.push(vault);

			set_nonce(n => n + 1);
		});
		set_factoriesActive(sortBy(_factories, 'TITLE'));

	}, [chainID, active]);

	if (!active) {
		return (
			<section>
				<h1 className={ 'text-sm font-mono font-semibold text-ygray-900' }>{ 'Loading Ex' }<sup>{ '2' }</sup>{ ' 🧪...' }</h1>
			</section>
		);
	}

	return (
		<section>
			<div className={ 'mb-4' }>
				<h1 className={ 'text-3xl font-mono font-semibold text-ygray-900 leading-9 mb-6' }>{ 'Factory Experiments Registry' }</h1>

			</div>
			<div className={ 'grid grid-cols-4 gap-2' }>
				<div className={ 'col-span-1' }>


					<ul>
						{ factoriesActive?.map((factory) => (
							<li key={ factory.TITLE } className={ 'cursor-pointer' }>
								<button href={ '#' } onClick={ (_) => set_activeFactory(factory.TITLE) }>
									<div className={ 'my-4 flex flex-row items-center' }>
										<span className={ 'flex flex-row items-center' }>
											{/* {
													factory.LOGO_ARR.map((letter, index) => (
														<div className={ index === 0 ? 'text-left w-5' : 'text-right w-5' } key={ `${factory.VAULT_SLUG}${index}${letter}` }>{ letter }</div>
													))
												} */}
										</span>
										<span className={ 'ml-4 text-base font-normal text-gray-700 font-mono dashed-underline-gray cursor-pointer' }>
											{ factory.TITLE }
										</span>
									</div>
								</button>
							</li>
						)) }
					</ul>

					<hr className={ 'border-solid' } />
					<h1 className={ 'text-1xl font-mono font-semibold text-ygray-900 leading-9 mb-6' }>{ 'Connectable UIs' }</h1>
					<hr className={ 'border-solid' } />

					<ul>
						{ UIsActive?.map((factory) => (
							<li key={ factory.TITLE } className={ 'cursor-pointer' }>
								<button href={ '#' } onClick={ (_) => set_activeFactory(factory.TITLE) }>
									<div className={ 'my-4 flex flex-row items-center' }>
										<span className={ 'flex flex-row items-center' }>
											{/* {
													factory.LOGO_ARR.map((letter, index) => (
														<div className={ index === 0 ? 'text-left w-5' : 'text-right w-5' } key={ `${factory.VAULT_SLUG}${index}${letter}` }>{ letter }</div>
													))
												} */}
										</span>
										<span className={ 'ml-4 text-base font-normal text-gray-700 font-mono dashed-underline-gray cursor-pointer' }>
											{ factory.TITLE }
										</span>
									</div>
								</button>
							</li>
						)) }
					</ul>
				</div>

				<div className={ 'col-span-3 gap-2 mt-3' }>
					<div ref={ autoUIRef } />
				</div>
			</div>
		</section>
	);
}

export default Index;
