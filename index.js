// Setup our environment variables via dotenv
require('dotenv').config()
const mainnetEndpoint = "https://api.thegraph.com/subgraphs/name/geraldhost/union";
const axios = require('axios');
const { ethers } = require('ethers');
const fetch = require('node-fetch');
const network = "mainnet";
const alchemyApiKey = process.env.ALCHEMY_KEY;
const provider = new ethers.AlchemyProvider(network, alchemyApiKey);

// Import relevant classes from discord.js
const { Client, Intents, Interaction, Constants, MessageEmbed} = require('discord.js');
const { url } = require('inspector');
const { json } = require('stream/consumers');
const { time } = require('console');

const client = new Client(
    { intents: [Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_MESSAGES] }
);



client.on('ready', function(e){
    console.log(`Logged in as ${client.user.tag}!`)

    //guild is link for discord, e.g. Union is 714982388970684468  https://discord.com/channels/714982388970684468/.....
    const guildId = "1145455083820163103";
    const guild = client.guilds.cache.get(guildId);
    let commands

    if (guild) {
        commands = guild.commands
    } else {
        commands = client.application?.commands
    }

    commands?.create({
        name: "get-recent-proposals",
        description: "Returns up to 5 of the recent proposals for Union DAO",
    })

    commands?.create({
        name: "get-proposal",
        description: "Get details of a proposal on Union DAO",
        options: [
            {
                name: 'id',
                description: 'ID of proposal',
                required: true,
                type: Constants.ApplicationCommandOptionTypes.STRING
            }
        ]
    })

    commands?.create({
        name: "get-recent-stakers",
        description: "Returns up to 10 of the recent stakers for Union",
    })
    commands?.create({
        name: "get-staker-info",
        description: "Get info about staker",
        options: [
            {
                name: 'id',
                description: 'id of staker',
                required: true,
                type: Constants.ApplicationCommandOptionTypes.STRING
            }
        ]
    })

    commands?.create({
        name: "get-debt-write-off",
        description: "Get info about debt write off",
        options: [
            {
                name: 'id',
                description: 'id of debt write off',
                required: true,
                type: Constants.ApplicationCommandOptionTypes.STRING
            }
        ]
    })

    commands?.create({
        name: "get-debt-write-offs",
        description: "Returns up to 10 of the debt writeoffs for Union",
    })
    

    // commands?.create({
    //     name: "get-deposits",
    //     description: "Returns up to 10 of the deposits for Union",
    // })
    // commands?.create({
    //     name: "get-deposit-info",
    //     description: "Get info about a deposit",
    //     options: [
    //         {
    //             name: 'id',
    //             description: 'id of deposit',
    //             required: true,
    //             type: Constants.ApplicationCommandOptionTypes.STRING
    //         }
    //     ]
    // })

    commands?.create({
        name: "get-member-applications",
        description: "Returns up to 10 of the latest member applications for Union",
    })

    commands?.create({
        name: "enstest",
        description: "enstest",
    })
    

})

client.on('interactionCreate', async (interaction) => {
    if (!interaction.isCommand()) {
        return
    }

    const { commandName, options} = interaction

    if (commandName === 'get-proposal') {
        id = options.getString('id')
        console.log(id)
        const query = `
        {
            proposalUpdate(
              id: "${id}"
            ) {
              action
              proposer
              pid
              id
            }
            proposal(
              id: "${id}"
            ) {
              description
              proposer
              targets
              pid
              id
            }
          }
        `;

        axios.post(mainnetEndpoint, { query })
            .then(response => {
                if (response.data.errors) {
                    console.error('GraphQL Errors:', response.data.errors);
                    interaction.reply({
                        content: "An error occurred while fetching the proposal."
                    });
                    return;
                }
                const proposal = response.data.data.proposal;
                const proposalUpdate = response.data.data.proposalUpdate;

                if (proposal) {
                    const proposalsEmbed = new MessageEmbed()
                        .setColor('#0099ff')
                        .setTitle(`Recent Proposal`);

                    proposalsEmbed.addField("ID", proposal.id);
                    proposalsEmbed.addField("Proposer", proposal.proposer);

                    const desc = proposal.description;
                    const maxLength = 1024;

                    // Extract everything before the first '#' character
                    const firstPart = desc.split('#')[0];

                    // Add the extracted part as a field
                    proposalsEmbed.addField("Title", firstPart);


                    // Remove "-" and everything after it from proposal ID
                    const proposalIdClean = proposal.id.split('-')[0];

                    // Add a link to the proposal using the cleaned proposal ID
                    const proposalLink = `https://app.union.finance/governance/proposals/${proposalIdClean}`;
                    proposalsEmbed.addField("Proposal Link", proposalLink);

                    proposalsEmbed.addField("Action", proposalUpdate.action);

                    proposalsEmbed.addField("\u200B", "\u200B");

                    interaction.reply({ embeds: [proposalsEmbed] });
                } else {
                    interaction.reply({
                        content: "No recent proposal found."
                    });
                }
            })
        .catch(err => console.error(err));

    } else if (commandName === 'get-recent-proposals') {
        
        const query = `
            {
                proposals(first: 5) {
                    description
                    id
                    proposer
                    targets
                }
            }
        `;

        axios.post(mainnetEndpoint, { query })
            .then(response => {
                const proposals = response.data.data.proposals;

                if (proposals && proposals.length > 0) {
                    const proposalsEmbed = new MessageEmbed()
                        .setColor('#0099ff')
                        .setTitle(`Recent Proposals`);

                    proposals.forEach(proposal => {
                        proposalsEmbed.addField("ID", proposal.id);
                        proposalsEmbed.addField("Proposer", proposal.proposer);
                        // const desc = proposal.description;
                        // const maxLength = 1024;

                        // // Split the description into chunks of maxLength
                        // const chunks = [];
                        // for (let i = 0; i < desc.length; i += maxLength) {
                        //     chunks.push(desc.substring(i, i + maxLength));
                        // }

                        // // Add each chunk as a separate field
                        // chunks.forEach(chunk => {
                        //     proposalsEmbed.addField("Description", chunk);
                        // });
                        const desc = proposal.description;
                        const maxLength = 1024;

                        // Extract everything before the first '#' character
                        const firstPart = desc.split('#')[0];

                        // Add the extracted part as a field
                        proposalsEmbed.addField("Title", firstPart);
                        const proposalIdClean = proposal.id.split('-')[0];

                        // Add a link to the proposal using the cleaned proposal ID
                        const proposalLink = `https://app.union.finance/governance/proposals/${proposalIdClean}`;
                        proposalsEmbed.addField("Proposal Link", proposalLink);
                        // const targets = proposal.targets.join(", ");
                        // proposalsEmbed.addField("Targets", targets);

                        proposalsEmbed.addField("\u200B", "\u200B");
                    });

                    interaction.reply({ embeds: [proposalsEmbed] });
                } else {
                    interaction.reply({
                        content: "No recent proposals found."
                    });
                }
            })
            .catch(error => {
                console.error('Error fetching proposals:', error);
                interaction.reply({
                    content: "An error occurred while fetching proposals."
                });
            });
    } else if (commandName === 'get-recent-stakers') {
        
        const query = `
            {
                stakers(
                    orderBy: timestamp
                    first: 10
                    orderDirection: desc
                    where: {stakedAmount_not: "0", totalFrozen_not: "0"}
                ) {
                    stakedAmount
                    totalLockedStake
                    totalFrozen
                    creditLimit
                    account
                }
            }
        `;
    
        axios.post(mainnetEndpoint, { query })
            .then(response => {
                const stakers = response.data.data.stakers;
    
                if (stakers && stakers.length > 0) {
                    const stakersEmbed = new MessageEmbed()
                        .setColor('#0099ff')
                        .setTitle(`Recent Stakers`);
    
                    stakers.forEach(staker => {
                        stakersEmbed.addField("Account", staker.account);
                        stakersEmbed.addField("Staked Amount", `${weiToReadableDai(staker.stakedAmount)} DAI`);
                        stakersEmbed.addField("Total Locked Stake", `${weiToReadableDai(staker.totalLockedStake)} DAI`);
                        stakersEmbed.addField("Total Frozen", `${weiToReadableDai(staker.totalFrozen)} DAI `);
                        stakersEmbed.addField("Credit Limit", `${weiToReadableDai(staker.creditLimit)} DAI`);
    
                        stakersEmbed.addField("\u200B", "\u200B");
                    });
    
                    interaction.reply({ embeds: [stakersEmbed] });
                } else {
                    interaction.reply({
                        content: "No recent stakers found."
                    });
                }
            })
            .catch(error => {
                console.error('Error fetching stakers:', error);
                interaction.reply({
                    content: "An error occurred while fetching stakers."
                });
            });
    } else if (commandName === 'get-member-applications') {
        const query = `
            {
                memberApplications(first: 8, orderBy: timestamp) {
                    applicant
                    staker
                }
            }
        `;
    
        axios.post(mainnetEndpoint, { query })
            .then(async response => {
                const applications = response.data.data.memberApplications;
    
                if (applications && applications.length > 0) {
                    const applicationsEmbed = new MessageEmbed()
                        .setColor('#0099ff')
                        .setTitle(`Member Applications`);
    
                    for (const application of applications) {
                        const applicant = application.applicant;
                        const staker = application.staker;
    
                        applicationsEmbed.addField("Applicant", applicant);
                        applicationsEmbed.addField("Staker", staker);
                        applicationsEmbed.addField("\u200B", "\u200B");

                    }
    
                    interaction.reply({ embeds: [applicationsEmbed] });
                } else {
                    interaction.reply({
                        content: "No member applications found."
                    });
                }
            })
            .catch(error => {
                console.error('Error fetching member applications:', error);
                interaction.reply({
                    content: "An error occurred while fetching member applications."
                });
            });
    } 
    else if (commandName === 'get-staker-info') {
        id = options.getString('id')
        console.log(id)
            const query = `
                {
                    staker(id: "${id}") {
                        account
                        creditLimit
                        stakedAmount
                        totalFrozen
                        totalLockedStake
                    }
                }
            `;
    
            axios.post(mainnetEndpoint, { query })
            .then(async response => {
                const stakerData = response.data.data.staker;

                if (stakerData) {
                    // Check if ENS info is available
                    

                    const stakerEmbed = new MessageEmbed()
                        .setColor('#0099ff')
                        .setTitle(`Staker Information`)
                        .addField("Account", stakerData.account)
                        .addField("Credit Limit", `${weiToReadableDai(stakerData.creditLimit)} DAI`)
                        .addField("Staked Amount", `${weiToReadableDai(stakerData.stakedAmount)} DAI`)
                        .addField("Total Frozen", `${weiToReadableDai(stakerData.totalFrozen)} DAI`)
                        .addField("Total Locked Stake", `${weiToReadableDai(stakerData.totalLockedStake)} DAI`);

                    
                    console.log("Sending embed...");
                    interaction.reply({ embeds: [stakerEmbed] });
                } else {
                    interaction.reply({
                        content: "No staker information found."
                    });
                }
            })
                .catch(error => {
                    console.error('Error fetching staker information:', error);
                    interaction.reply({
                        content: "An error occurred while fetching staker information."
                    });
                });
        }
    else if (commandName === 'enstest') {
       
        const initialMessage = await interaction.reply("Processing... Please wait.");

    const ensNamePromise = fetchENSInfo("0xb7658aac84dbe5924badc9d780c36442dd46306e");

    ensNamePromise
        .then(ensName => {
            const stakerEmbed = new MessageEmbed()
                .setColor('#0099ff')
                .setTitle(`Staker Information`)
                if (ensName) {
                    stakerEmbed.addField("Account", ensName);
                } else {
                    stakerEmbed.addField("Account", "ENS Name Not Found");
                }

            console.log("Sending embed...");
            interaction.editReply({ embeds: [stakerEmbed] });
        })
        .catch(error => {
            console.error('Error fetching ENS info:', error);
            interaction.editReply("An error occurred while fetching ENS info.");
        });
    } if (commandName === 'get-debt-write-offs') {
        const query = `
            {
                debtWriteOffs(first: 10, orderBy: timestamp, orderDirection: desc) {
                    amount
                    id
                }
            }
        `;
    
        axios.post(mainnetEndpoint, { query })
            .then(async response => {
                const debtWriteOffs = response.data.data.debtWriteOffs;
    
                if (debtWriteOffs && debtWriteOffs.length > 0) {
                    const debtWriteOffsEmbed = new MessageEmbed()
                        .setColor('#0099ff')
                        .setTitle(`Debt Write-Offs`);
    
                    for (const writeOff of debtWriteOffs) {
                        const amount = writeOff.amount;
                        const id = writeOff.id
    
                        debtWriteOffsEmbed.addField("Amount", `${weiToReadableDai(amount)} DAI`);
                        debtWriteOffsEmbed.addField("ID", id);
                        debtWriteOffsEmbed.addField("\u200B", "\u200B");
                    }
    
                    interaction.reply({ embeds: [debtWriteOffsEmbed] });
                } else {
                    interaction.reply({
                        content: "No debt write-offs found."
                    });
                }
            })
            .catch(error => {
                console.error('Error fetching debt write-offs:', error);
                interaction.reply({
                    content: "An error occurred while fetching debt write-offs."
                });
            });
    } else if (commandName === 'get-debt-write-off') {
        id = options.getString('id')
        console.log(id)
        const query = `
            {
                debtWriteOff(
                    id: "${id}"
                ) {
                    amount
                    staker
                    borrower
                }
            }
        `;
    
        axios.post(mainnetEndpoint, { query })
            .then(response => {
                const debtWriteOff = response.data.data.debtWriteOff;
    
                if (debtWriteOff) {
                    const debtWriteOffEmbed = new MessageEmbed()
                        .setColor('#0099ff')
                        .setTitle(`Debt Write Off`)
                        .addField("Amount", `${debtWriteOff.amount} DAI`)
                        .addField("Staker", debtWriteOff.staker)
                        .addField("Borrower", debtWriteOff.borrower);
    
                    interaction.reply({ embeds: [debtWriteOffEmbed] });
                } else {
                    interaction.reply({
                        content: "No debt write off information found."
                    });
                }
            })
            .catch(error => {
                console.error('Error fetching debt write off information:', error);
                interaction.reply({
                    content: "An error occurred while fetching debt write off information."
                });
            });
    }
    
    

})


async function getResponse(url) {
	console.log(url)

    let options = {method: 'GET', headers: {'Content-Type': 'application/json'}};

    const data = await fetch(url, options)
    .then(res => res.json())
    .then(json => console.log(json.Floor_Price))
    .catch(err => console.error('error:' + err));
    return data
}

function weiToReadableDai(weiAmount) {
    const decimals = 18; // Decimals for DAI token

    const divisor = 10 ** decimals;

    const readableDaiAmount = parseFloat(weiAmount) / divisor;
    return readableDaiAmount.toFixed(2); // Return with correct decimal precision
}



async function fetchENSInfo(address) {    
    //const address = '0xb7658aac84dbe5924badc9d780c36442dd46306e';
    const ensName = await provider.lookupAddress(address);
    //const ensAvatarUrl = await provider.getAvatar(ensName);

    console.log(`ENS Name: ${ensName}`);
    //console.log(`ENS Avatar URL: ${ensAvatarUrl}`);
    // return provider.lookupAddress(address)
    //     .then(ensName => provider.getAvatar(ensName)
    //         .then(ensAvatarUrl => ({ ensName, ensAvatarUrl }))
    //     );
}

client.login(process.env.DISCORD_TOKEN)