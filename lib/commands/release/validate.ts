/**
 * @license
 * Copyright 2016-2020 Balena Ltd.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *    http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import { flags } from '@oclif/command';
import Command from '../../command';
import * as cf from '../../utils/common-flags';
import { getBalenaSdk, stripIndent } from '../../utils/lazy';
import { tryAsInteger } from '../../utils/validation';

interface FlagsDef {
	help: void;
}

interface ArgsDef {
	commitOrId: string | number;
}

export default class ReleaseValidateCmd extends Command {
	public static description = stripIndent`
		Validate a release.

		Validate a release.

		Valid releases are automatically deployed to devices tracking the latest
		release if they are finalized.
`;
	public static examples = [
		'$ balena release validate a777f7345fe3d655c1c981aa642e5555',
		'$ balena release validate 1234567',
	];

	public static usage = 'release validate <commitOrId>';

	public static flags: flags.Input<FlagsDef> = {
		help: cf.help,
	};

	public static args = [
		{
			name: 'commitOrId',
			description: 'the commit or ID of the release to validate',
			required: true,
			parse: (commitOrId: string) => tryAsInteger(commitOrId),
		},
	];

	public static authenticated = true;

	public async run() {
		const { args: params } = this.parse<FlagsDef, ArgsDef>(ReleaseValidateCmd);

		const balena = getBalenaSdk();

		const release = await balena.models.release.get(params.commitOrId, {
			$select: ['id', 'is_invalidated'],
		});

		if (!release.is_invalidated) {
			console.log(`Release ${params.commitOrId} is already validated!`);
			return;
		}

		await balena.models.release.setIsInvalidated(release.id, false);
		console.log(`Release ${params.commitOrId} validated`);
	}
}
