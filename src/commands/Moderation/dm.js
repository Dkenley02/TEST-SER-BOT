import {
    SlashCommandBuilder,
    PermissionFlagsBits,
    MessageFlags
} from 'discord.js';

import { errorEmbed, successEmbed } from '../../utils/embeds.js';
import { logger } from '../../utils/logger.js';
import { InteractionHelper } from '../../utils/interactionHelper.js';

export default {
    data: new SlashCommandBuilder()
        .setName("say")
        .setDescription("Send an embed message to a channel")
        .addChannelOption(option =>
            option
                .setName("channel")
                .setDescription("Channel to send the message to")
                .setRequired(true)
        )
        .addStringOption(option =>
            option
                .setName("title")
                .setDescription("Embed title")
                .setRequired(true)
        )
        .addStringOption(option =>
            option
                .setName("message")
                .setDescription("Embed message")
                .setRequired(true)
        )
        .setDefaultMemberPermissions(PermissionFlagsBits.ManageMessages)
        .setDMPermission(false),

    category: "Utility",

    async execute(interaction) {
        const deferSuccess = await InteractionHelper.safeDefer(interaction);

        if (!deferSuccess) {
            logger.warn("Say command defer failed");
            return;
        }

        const channel = interaction.options.getChannel("channel");
        const title = interaction.options.getString("title");
        const message = interaction.options.getString("message");

        try {
            if (!channel.isTextBased()) {
                return await InteractionHelper.safeEditReply(interaction, {
                    embeds: [
                        errorEmbed(
                            "Invalid Channel",
                            "Please select a text channel."
                        )
                    ],
                    flags: MessageFlags.Ephemeral
                });
            }

            await channel.send({
                embeds: [
                    {
                        title: title,
                        description: message,
                        color: 0x279CF5
                    }
                ]
            });

            return await InteractionHelper.safeEditReply(interaction, {
                embeds: [
                    successEmbed(
                        "Message Sent",
                        `Successfully sent embed to ${channel}`
                    )
                ],
                flags: MessageFlags.Ephemeral
            });

        } catch (error) {
            logger.error("Say command error:", error);

            return await InteractionHelper.safeEditReply(interaction, {
                embeds: [
                    errorEmbed(
                        "Error",
                        `Failed to send message: ${error.message}`
                    )
                ]
            });
        }
    }
};


