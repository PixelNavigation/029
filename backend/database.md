| table_schema | table_name                 | column_name                  | data_type                   |
| ------------ | -------------------------- | ---------------------------- | --------------------------- |
| auth         | audit_log_entries          | instance_id                  | uuid                        |
| auth         | audit_log_entries          | id                           | uuid                        |
| auth         | audit_log_entries          | payload                      | json                        |
| auth         | audit_log_entries          | created_at                   | timestamp with time zone    |
| auth         | audit_log_entries          | ip_address                   | character varying           |
| auth         | custom_oauth_providers     | id                           | uuid                        |
| auth         | custom_oauth_providers     | provider_type                | text                        |
| auth         | custom_oauth_providers     | identifier                   | text                        |
| auth         | custom_oauth_providers     | name                         | text                        |
| auth         | custom_oauth_providers     | client_id                    | text                        |
| auth         | custom_oauth_providers     | client_secret                | text                        |
| auth         | custom_oauth_providers     | acceptable_client_ids        | ARRAY                       |
| auth         | custom_oauth_providers     | scopes                       | ARRAY                       |
| auth         | custom_oauth_providers     | pkce_enabled                 | boolean                     |
| auth         | custom_oauth_providers     | attribute_mapping            | jsonb                       |
| auth         | custom_oauth_providers     | authorization_params         | jsonb                       |
| auth         | custom_oauth_providers     | enabled                      | boolean                     |
| auth         | custom_oauth_providers     | email_optional               | boolean                     |
| auth         | custom_oauth_providers     | issuer                       | text                        |
| auth         | custom_oauth_providers     | discovery_url                | text                        |
| auth         | custom_oauth_providers     | skip_nonce_check             | boolean                     |
| auth         | custom_oauth_providers     | cached_discovery             | jsonb                       |
| auth         | custom_oauth_providers     | discovery_cached_at          | timestamp with time zone    |
| auth         | custom_oauth_providers     | authorization_url            | text                        |
| auth         | custom_oauth_providers     | token_url                    | text                        |
| auth         | custom_oauth_providers     | userinfo_url                 | text                        |
| auth         | custom_oauth_providers     | jwks_uri                     | text                        |
| auth         | custom_oauth_providers     | created_at                   | timestamp with time zone    |
| auth         | custom_oauth_providers     | updated_at                   | timestamp with time zone    |
| auth         | flow_state                 | id                           | uuid                        |
| auth         | flow_state                 | user_id                      | uuid                        |
| auth         | flow_state                 | auth_code                    | text                        |
| auth         | flow_state                 | code_challenge_method        | USER-DEFINED                |
| auth         | flow_state                 | code_challenge               | text                        |
| auth         | flow_state                 | provider_type                | text                        |
| auth         | flow_state                 | provider_access_token        | text                        |
| auth         | flow_state                 | provider_refresh_token       | text                        |
| auth         | flow_state                 | created_at                   | timestamp with time zone    |
| auth         | flow_state                 | updated_at                   | timestamp with time zone    |
| auth         | flow_state                 | authentication_method        | text                        |
| auth         | flow_state                 | auth_code_issued_at          | timestamp with time zone    |
| auth         | flow_state                 | invite_token                 | text                        |
| auth         | flow_state                 | referrer                     | text                        |
| auth         | flow_state                 | oauth_client_state_id        | uuid                        |
| auth         | flow_state                 | linking_target_id            | uuid                        |
| auth         | flow_state                 | email_optional               | boolean                     |
| auth         | identities                 | provider_id                  | text                        |
| auth         | identities                 | user_id                      | uuid                        |
| auth         | identities                 | identity_data                | jsonb                       |
| auth         | identities                 | provider                     | text                        |
| auth         | identities                 | last_sign_in_at              | timestamp with time zone    |
| auth         | identities                 | created_at                   | timestamp with time zone    |
| auth         | identities                 | updated_at                   | timestamp with time zone    |
| auth         | identities                 | email                        | text                        |
| auth         | identities                 | id                           | uuid                        |
| auth         | instances                  | id                           | uuid                        |
| auth         | instances                  | uuid                         | uuid                        |
| auth         | instances                  | raw_base_config              | text                        |
| auth         | instances                  | created_at                   | timestamp with time zone    |
| auth         | instances                  | updated_at                   | timestamp with time zone    |
| auth         | mfa_amr_claims             | session_id                   | uuid                        |
| auth         | mfa_amr_claims             | created_at                   | timestamp with time zone    |
| auth         | mfa_amr_claims             | updated_at                   | timestamp with time zone    |
| auth         | mfa_amr_claims             | authentication_method        | text                        |
| auth         | mfa_amr_claims             | id                           | uuid                        |
| auth         | mfa_challenges             | id                           | uuid                        |
| auth         | mfa_challenges             | factor_id                    | uuid                        |
| auth         | mfa_challenges             | created_at                   | timestamp with time zone    |
| auth         | mfa_challenges             | verified_at                  | timestamp with time zone    |
| auth         | mfa_challenges             | ip_address                   | inet                        |
| auth         | mfa_challenges             | otp_code                     | text                        |
| auth         | mfa_challenges             | web_authn_session_data       | jsonb                       |
| auth         | mfa_factors                | id                           | uuid                        |
| auth         | mfa_factors                | user_id                      | uuid                        |
| auth         | mfa_factors                | friendly_name                | text                        |
| auth         | mfa_factors                | factor_type                  | USER-DEFINED                |
| auth         | mfa_factors                | status                       | USER-DEFINED                |
| auth         | mfa_factors                | created_at                   | timestamp with time zone    |
| auth         | mfa_factors                | updated_at                   | timestamp with time zone    |
| auth         | mfa_factors                | secret                       | text                        |
| auth         | mfa_factors                | phone                        | text                        |
| auth         | mfa_factors                | last_challenged_at           | timestamp with time zone    |
| auth         | mfa_factors                | web_authn_credential         | jsonb                       |
| auth         | mfa_factors                | web_authn_aaguid             | uuid                        |
| auth         | mfa_factors                | last_webauthn_challenge_data | jsonb                       |
| auth         | oauth_authorizations       | id                           | uuid                        |
| auth         | oauth_authorizations       | authorization_id             | text                        |
| auth         | oauth_authorizations       | client_id                    | uuid                        |
| auth         | oauth_authorizations       | user_id                      | uuid                        |
| auth         | oauth_authorizations       | redirect_uri                 | text                        |
| auth         | oauth_authorizations       | scope                        | text                        |
| auth         | oauth_authorizations       | state                        | text                        |
| auth         | oauth_authorizations       | resource                     | text                        |
| auth         | oauth_authorizations       | code_challenge               | text                        |
| auth         | oauth_authorizations       | code_challenge_method        | USER-DEFINED                |
| auth         | oauth_authorizations       | response_type                | USER-DEFINED                |
| auth         | oauth_authorizations       | status                       | USER-DEFINED                |
| auth         | oauth_authorizations       | authorization_code           | text                        |
| auth         | oauth_authorizations       | created_at                   | timestamp with time zone    |
| auth         | oauth_authorizations       | expires_at                   | timestamp with time zone    |
| auth         | oauth_authorizations       | approved_at                  | timestamp with time zone    |
| auth         | oauth_authorizations       | nonce                        | text                        |
| auth         | oauth_client_states        | id                           | uuid                        |
| auth         | oauth_client_states        | provider_type                | text                        |
| auth         | oauth_client_states        | code_verifier                | text                        |
| auth         | oauth_client_states        | created_at                   | timestamp with time zone    |
| auth         | oauth_clients              | id                           | uuid                        |
| auth         | oauth_clients              | client_secret_hash           | text                        |
| auth         | oauth_clients              | registration_type            | USER-DEFINED                |
| auth         | oauth_clients              | redirect_uris                | text                        |
| auth         | oauth_clients              | grant_types                  | text                        |
| auth         | oauth_clients              | client_name                  | text                        |
| auth         | oauth_clients              | client_uri                   | text                        |
| auth         | oauth_clients              | logo_uri                     | text                        |
| auth         | oauth_clients              | created_at                   | timestamp with time zone    |
| auth         | oauth_clients              | updated_at                   | timestamp with time zone    |
| auth         | oauth_clients              | deleted_at                   | timestamp with time zone    |
| auth         | oauth_clients              | client_type                  | USER-DEFINED                |
| auth         | oauth_clients              | token_endpoint_auth_method   | text                        |
| auth         | oauth_consents             | id                           | uuid                        |
| auth         | oauth_consents             | user_id                      | uuid                        |
| auth         | oauth_consents             | client_id                    | uuid                        |
| auth         | oauth_consents             | scopes                       | text                        |
| auth         | oauth_consents             | granted_at                   | timestamp with time zone    |
| auth         | oauth_consents             | revoked_at                   | timestamp with time zone    |
| auth         | one_time_tokens            | id                           | uuid                        |
| auth         | one_time_tokens            | user_id                      | uuid                        |
| auth         | one_time_tokens            | token_type                   | USER-DEFINED                |
| auth         | one_time_tokens            | token_hash                   | text                        |
| auth         | one_time_tokens            | relates_to                   | text                        |
| auth         | one_time_tokens            | created_at                   | timestamp without time zone |
| auth         | one_time_tokens            | updated_at                   | timestamp without time zone |
| auth         | refresh_tokens             | instance_id                  | uuid                        |
| auth         | refresh_tokens             | id                           | bigint                      |
| auth         | refresh_tokens             | token                        | character varying           |
| auth         | refresh_tokens             | user_id                      | character varying           |
| auth         | refresh_tokens             | revoked                      | boolean                     |
| auth         | refresh_tokens             | created_at                   | timestamp with time zone    |
| auth         | refresh_tokens             | updated_at                   | timestamp with time zone    |
| auth         | refresh_tokens             | parent                       | character varying           |
| auth         | refresh_tokens             | session_id                   | uuid                        |
| auth         | saml_providers             | id                           | uuid                        |
| auth         | saml_providers             | sso_provider_id              | uuid                        |
| auth         | saml_providers             | entity_id                    | text                        |
| auth         | saml_providers             | metadata_xml                 | text                        |
| auth         | saml_providers             | metadata_url                 | text                        |
| auth         | saml_providers             | attribute_mapping            | jsonb                       |
| auth         | saml_providers             | created_at                   | timestamp with time zone    |
| auth         | saml_providers             | updated_at                   | timestamp with time zone    |
| auth         | saml_providers             | name_id_format               | text                        |
| auth         | saml_relay_states          | id                           | uuid                        |
| auth         | saml_relay_states          | sso_provider_id              | uuid                        |
| auth         | saml_relay_states          | request_id                   | text                        |
| auth         | saml_relay_states          | for_email                    | text                        |
| auth         | saml_relay_states          | redirect_to                  | text                        |
| auth         | saml_relay_states          | created_at                   | timestamp with time zone    |
| auth         | saml_relay_states          | updated_at                   | timestamp with time zone    |
| auth         | saml_relay_states          | flow_state_id                | uuid                        |
| auth         | schema_migrations          | version                      | character varying           |
| auth         | sessions                   | id                           | uuid                        |
| auth         | sessions                   | user_id                      | uuid                        |
| auth         | sessions                   | created_at                   | timestamp with time zone    |
| auth         | sessions                   | updated_at                   | timestamp with time zone    |
| auth         | sessions                   | factor_id                    | uuid                        |
| auth         | sessions                   | aal                          | USER-DEFINED                |
| auth         | sessions                   | not_after                    | timestamp with time zone    |
| auth         | sessions                   | refreshed_at                 | timestamp without time zone |
| auth         | sessions                   | user_agent                   | text                        |
| auth         | sessions                   | ip                           | inet                        |
| auth         | sessions                   | tag                          | text                        |
| auth         | sessions                   | oauth_client_id              | uuid                        |
| auth         | sessions                   | refresh_token_hmac_key       | text                        |
| auth         | sessions                   | refresh_token_counter        | bigint                      |
| auth         | sessions                   | scopes                       | text                        |
| auth         | sso_domains                | id                           | uuid                        |
| auth         | sso_domains                | sso_provider_id              | uuid                        |
| auth         | sso_domains                | domain                       | text                        |
| auth         | sso_domains                | created_at                   | timestamp with time zone    |
| auth         | sso_domains                | updated_at                   | timestamp with time zone    |
| auth         | sso_providers              | id                           | uuid                        |
| auth         | sso_providers              | resource_id                  | text                        |
| auth         | sso_providers              | created_at                   | timestamp with time zone    |
| auth         | sso_providers              | updated_at                   | timestamp with time zone    |
| auth         | sso_providers              | disabled                     | boolean                     |
| auth         | users                      | instance_id                  | uuid                        |
| auth         | users                      | id                           | uuid                        |
| auth         | users                      | aud                          | character varying           |
| auth         | users                      | role                         | character varying           |
| auth         | users                      | email                        | character varying           |
| auth         | users                      | encrypted_password           | character varying           |
| auth         | users                      | email_confirmed_at           | timestamp with time zone    |
| auth         | users                      | invited_at                   | timestamp with time zone    |
| auth         | users                      | confirmation_token           | character varying           |
| auth         | users                      | confirmation_sent_at         | timestamp with time zone    |
| auth         | users                      | recovery_token               | character varying           |
| auth         | users                      | recovery_sent_at             | timestamp with time zone    |
| auth         | users                      | email_change_token_new       | character varying           |
| auth         | users                      | email_change                 | character varying           |
| auth         | users                      | email_change_sent_at         | timestamp with time zone    |
| auth         | users                      | last_sign_in_at              | timestamp with time zone    |
| auth         | users                      | raw_app_meta_data            | jsonb                       |
| auth         | users                      | raw_user_meta_data           | jsonb                       |
| auth         | users                      | is_super_admin               | boolean                     |
| auth         | users                      | created_at                   | timestamp with time zone    |
| auth         | users                      | updated_at                   | timestamp with time zone    |
| auth         | users                      | phone                        | text                        |
| auth         | users                      | phone_confirmed_at           | timestamp with time zone    |
| auth         | users                      | phone_change                 | text                        |
| auth         | users                      | phone_change_token           | character varying           |
| auth         | users                      | phone_change_sent_at         | timestamp with time zone    |
| auth         | users                      | confirmed_at                 | timestamp with time zone    |
| auth         | users                      | email_change_token_current   | character varying           |
| auth         | users                      | email_change_confirm_status  | smallint                    |
| auth         | users                      | banned_until                 | timestamp with time zone    |
| auth         | users                      | reauthentication_token       | character varying           |
| auth         | users                      | reauthentication_sent_at     | timestamp with time zone    |
| auth         | users                      | is_sso_user                  | boolean                     |
| auth         | users                      | deleted_at                   | timestamp with time zone    |
| auth         | users                      | is_anonymous                 | boolean                     |
| auth         | webauthn_challenges        | id                           | uuid                        |
| auth         | webauthn_challenges        | user_id                      | uuid                        |
| auth         | webauthn_challenges        | challenge_type               | text                        |
| auth         | webauthn_challenges        | session_data                 | jsonb                       |
| auth         | webauthn_challenges        | created_at                   | timestamp with time zone    |
| auth         | webauthn_challenges        | expires_at                   | timestamp with time zone    |
| auth         | webauthn_credentials       | id                           | uuid                        |
| auth         | webauthn_credentials       | user_id                      | uuid                        |
| auth         | webauthn_credentials       | credential_id                | bytea                       |
| auth         | webauthn_credentials       | public_key                   | bytea                       |
| auth         | webauthn_credentials       | attestation_type             | text                        |
| auth         | webauthn_credentials       | aaguid                       | uuid                        |
| auth         | webauthn_credentials       | sign_count                   | bigint                      |
| auth         | webauthn_credentials       | transports                   | jsonb                       |
| auth         | webauthn_credentials       | backup_eligible              | boolean                     |
| auth         | webauthn_credentials       | backed_up                    | boolean                     |
| auth         | webauthn_credentials       | friendly_name                | text                        |
| auth         | webauthn_credentials       | created_at                   | timestamp with time zone    |
| auth         | webauthn_credentials       | updated_at                   | timestamp with time zone    |
| auth         | webauthn_credentials       | last_used_at                 | timestamp with time zone    |
| extensions   | pg_stat_statements         | userid                       | oid                         |
| extensions   | pg_stat_statements         | dbid                         | oid                         |
| extensions   | pg_stat_statements         | toplevel                     | boolean                     |
| extensions   | pg_stat_statements         | queryid                      | bigint                      |
| extensions   | pg_stat_statements         | query                        | text                        |
| extensions   | pg_stat_statements         | plans                        | bigint                      |
| extensions   | pg_stat_statements         | total_plan_time              | double precision            |
| extensions   | pg_stat_statements         | min_plan_time                | double precision            |
| extensions   | pg_stat_statements         | max_plan_time                | double precision            |
| extensions   | pg_stat_statements         | mean_plan_time               | double precision            |
| extensions   | pg_stat_statements         | stddev_plan_time             | double precision            |
| extensions   | pg_stat_statements         | calls                        | bigint                      |
| extensions   | pg_stat_statements         | total_exec_time              | double precision            |
| extensions   | pg_stat_statements         | min_exec_time                | double precision            |
| extensions   | pg_stat_statements         | max_exec_time                | double precision            |
| extensions   | pg_stat_statements         | mean_exec_time               | double precision            |
| extensions   | pg_stat_statements         | stddev_exec_time             | double precision            |
| extensions   | pg_stat_statements         | rows                         | bigint                      |
| extensions   | pg_stat_statements         | shared_blks_hit              | bigint                      |
| extensions   | pg_stat_statements         | shared_blks_read             | bigint                      |
| extensions   | pg_stat_statements         | shared_blks_dirtied          | bigint                      |
| extensions   | pg_stat_statements         | shared_blks_written          | bigint                      |
| extensions   | pg_stat_statements         | local_blks_hit               | bigint                      |
| extensions   | pg_stat_statements         | local_blks_read              | bigint                      |
| extensions   | pg_stat_statements         | local_blks_dirtied           | bigint                      |
| extensions   | pg_stat_statements         | local_blks_written           | bigint                      |
| extensions   | pg_stat_statements         | temp_blks_read               | bigint                      |
| extensions   | pg_stat_statements         | temp_blks_written            | bigint                      |
| extensions   | pg_stat_statements         | shared_blk_read_time         | double precision            |
| extensions   | pg_stat_statements         | shared_blk_write_time        | double precision            |
| extensions   | pg_stat_statements         | local_blk_read_time          | double precision            |
| extensions   | pg_stat_statements         | local_blk_write_time         | double precision            |
| extensions   | pg_stat_statements         | temp_blk_read_time           | double precision            |
| extensions   | pg_stat_statements         | temp_blk_write_time          | double precision            |
| extensions   | pg_stat_statements         | wal_records                  | bigint                      |
| extensions   | pg_stat_statements         | wal_fpi                      | bigint                      |
| extensions   | pg_stat_statements         | wal_bytes                    | numeric                     |
| extensions   | pg_stat_statements         | jit_functions                | bigint                      |
| extensions   | pg_stat_statements         | jit_generation_time          | double precision            |
| extensions   | pg_stat_statements         | jit_inlining_count           | bigint                      |
| extensions   | pg_stat_statements         | jit_inlining_time            | double precision            |
| extensions   | pg_stat_statements         | jit_optimization_count       | bigint                      |
| extensions   | pg_stat_statements         | jit_optimization_time        | double precision            |
| extensions   | pg_stat_statements         | jit_emission_count           | bigint                      |
| extensions   | pg_stat_statements         | jit_emission_time            | double precision            |
| extensions   | pg_stat_statements         | jit_deform_count             | bigint                      |
| extensions   | pg_stat_statements         | jit_deform_time              | double precision            |
| extensions   | pg_stat_statements         | stats_since                  | timestamp with time zone    |
| extensions   | pg_stat_statements         | minmax_stats_since           | timestamp with time zone    |
| extensions   | pg_stat_statements_info    | dealloc                      | bigint                      |
| extensions   | pg_stat_statements_info    | stats_reset                  | timestamp with time zone    |
| public       | certificates               | id                           | bigint                      |
| public       | certificates               | student_id                   | text                        |
| public       | certificates               | document_type                | text                        |
| public       | certificates               | file_name                    | text                        |
| public       | certificates               | file_url                     | text                        |
| public       | certificates               | file_size                    | bigint                      |
| public       | certificates               | uploaded_at                  | timestamp with time zone    |
| public       | certificates               | verification_status          | text                        |
| public       | certificates               | blockchain_hash              | text                        |
| public       | certificates               | is_on_blockchain             | boolean                     |
| public       | institutions               | id                           | bigint                      |
| public       | institutions               | institution_name             | character varying           |
| public       | institutions               | institution_code             | character varying           |
| public       | institutions               | email                        | character varying           |
| public       | institutions               | password                     | character varying           |
| public       | institutions               | website                      | character varying           |
| public       | institutions               | address                      | text                        |
| public       | institutions               | city                         | character varying           |
| public       | institutions               | state                        | character varying           |
| public       | institutions               | pincode                      | character varying           |
| public       | institutions               | established_year             | character varying           |
| public       | institutions               | institution_type             | character varying           |
| public       | institutions               | affiliated_board             | character varying           |
| public       | institutions               | contact_person_name          | character varying           |
| public       | institutions               | contact_person_email         | character varying           |
| public       | institutions               | contact_person_phone         | character varying           |
| public       | institutions               | contact_person_designation   | character varying           |
| public       | institutions               | institution_hash             | character varying           |
| public       | institutions               | role                         | character varying           |
| public       | institutions               | verified                     | boolean                     |
| public       | institutions               | created_at                   | timestamp with time zone    |
| public       | institutions               | updated_at                   | timestamp with time zone    |
| public       | official_records           | id                           | bigint                      |
| public       | official_records           | institution_name             | text                        |
| public       | official_records           | student_name                 | text                        |
| public       | official_records           | student_id                   | text                        |
| public       | official_records           | course_name                  | text                        |
| public       | official_records           | degree_type                  | text                        |
| public       | official_records           | cgpa                         | text                        |
| public       | official_records           | year_of_passing              | text                        |
| public       | official_records           | blockchain_hash              | text                        |
| public       | official_records           | subject_grades               | jsonb                       |
| public       | official_records           | semester                     | text                        |
| public       | official_records           | issuing_authority            | text                        |
| public       | public_profiles            | id                           | bigint                      |
| public       | public_profiles            | student_id                   | character varying           |
| public       | public_profiles            | name                         | character varying           |
| public       | public_profiles            | university                   | character varying           |
| public       | public_profiles            | course                       | character varying           |
| public       | public_profiles            | year                         | character varying           |
| public       | public_profiles            | profile_photo                | text                        |
| public       | public_profiles            | social_links                 | jsonb                       |
| public       | public_profiles            | bio                          | text                        |
| public       | public_profiles            | created_at                   | timestamp with time zone    |
| public       | public_profiles            | updated_at                   | timestamp with time zone    |
| public       | public_profiles            | profile_token                | uuid                        |
| public       | students                   | id                           | bigint                      |
| public       | students                   | email                        | character varying           |
| public       | students                   | password                     | character varying           |
| public       | students                   | student_id                   | character varying           |
| public       | students                   | phone                        | character varying           |
| public       | students                   | role                         | character varying           |
| public       | students                   | verified                     | boolean                     |
| public       | students                   | created_at                   | timestamp with time zone    |
| public       | students                   | updated_at                   | timestamp with time zone    |
| realtime     | messages                   | topic                        | text                        |
| realtime     | messages                   | extension                    | text                        |
| realtime     | messages                   | payload                      | jsonb                       |
| realtime     | messages                   | event                        | text                        |
| realtime     | messages                   | private                      | boolean                     |
| realtime     | messages                   | updated_at                   | timestamp without time zone |
| realtime     | messages                   | inserted_at                  | timestamp without time zone |
| realtime     | messages                   | id                           | uuid                        |
| realtime     | schema_migrations          | version                      | bigint                      |
| realtime     | schema_migrations          | inserted_at                  | timestamp without time zone |
| realtime     | subscription               | id                           | bigint                      |
| realtime     | subscription               | subscription_id              | uuid                        |
| realtime     | subscription               | entity                       | regclass                    |
| realtime     | subscription               | filters                      | ARRAY                       |
| realtime     | subscription               | claims                       | jsonb                       |
| realtime     | subscription               | claims_role                  | regrole                     |
| realtime     | subscription               | created_at                   | timestamp without time zone |
| realtime     | subscription               | action_filter                | text                        |
| storage      | buckets                    | id                           | text                        |
| storage      | buckets                    | name                         | text                        |
| storage      | buckets                    | owner                        | uuid                        |
| storage      | buckets                    | created_at                   | timestamp with time zone    |
| storage      | buckets                    | updated_at                   | timestamp with time zone    |
| storage      | buckets                    | public                       | boolean                     |
| storage      | buckets                    | avif_autodetection           | boolean                     |
| storage      | buckets                    | file_size_limit              | bigint                      |
| storage      | buckets                    | allowed_mime_types           | ARRAY                       |
| storage      | buckets                    | owner_id                     | text                        |
| storage      | buckets                    | type                         | USER-DEFINED                |
| storage      | buckets_analytics          | name                         | text                        |
| storage      | buckets_analytics          | type                         | USER-DEFINED                |
| storage      | buckets_analytics          | format                       | text                        |
| storage      | buckets_analytics          | created_at                   | timestamp with time zone    |
| storage      | buckets_analytics          | updated_at                   | timestamp with time zone    |
| storage      | buckets_analytics          | id                           | uuid                        |
| storage      | buckets_analytics          | deleted_at                   | timestamp with time zone    |
| storage      | buckets_vectors            | id                           | text                        |
| storage      | buckets_vectors            | type                         | USER-DEFINED                |
| storage      | buckets_vectors            | created_at                   | timestamp with time zone    |
| storage      | buckets_vectors            | updated_at                   | timestamp with time zone    |
| storage      | migrations                 | id                           | integer                     |
| storage      | migrations                 | name                         | character varying           |
| storage      | migrations                 | hash                         | character varying           |
| storage      | migrations                 | executed_at                  | timestamp without time zone |
| storage      | objects                    | id                           | uuid                        |
| storage      | objects                    | bucket_id                    | text                        |
| storage      | objects                    | name                         | text                        |
| storage      | objects                    | owner                        | uuid                        |
| storage      | objects                    | created_at                   | timestamp with time zone    |
| storage      | objects                    | updated_at                   | timestamp with time zone    |
| storage      | objects                    | last_accessed_at             | timestamp with time zone    |
| storage      | objects                    | metadata                     | jsonb                       |
| storage      | objects                    | path_tokens                  | ARRAY                       |
| storage      | objects                    | version                      | text                        |
| storage      | objects                    | owner_id                     | text                        |
| storage      | objects                    | user_metadata                | jsonb                       |
| storage      | s3_multipart_uploads       | id                           | text                        |
| storage      | s3_multipart_uploads       | in_progress_size             | bigint                      |
| storage      | s3_multipart_uploads       | upload_signature             | text                        |
| storage      | s3_multipart_uploads       | bucket_id                    | text                        |
| storage      | s3_multipart_uploads       | key                          | text                        |
| storage      | s3_multipart_uploads       | version                      | text                        |
| storage      | s3_multipart_uploads       | owner_id                     | text                        |
| storage      | s3_multipart_uploads       | created_at                   | timestamp with time zone    |
| storage      | s3_multipart_uploads       | user_metadata                | jsonb                       |
| storage      | s3_multipart_uploads       | metadata                     | jsonb                       |
| storage      | s3_multipart_uploads_parts | id                           | uuid                        |
| storage      | s3_multipart_uploads_parts | upload_id                    | text                        |
| storage      | s3_multipart_uploads_parts | size                         | bigint                      |
| storage      | s3_multipart_uploads_parts | part_number                  | integer                     |
| storage      | s3_multipart_uploads_parts | bucket_id                    | text                        |
| storage      | s3_multipart_uploads_parts | key                          | text                        |
| storage      | s3_multipart_uploads_parts | etag                         | text                        |
| storage      | s3_multipart_uploads_parts | owner_id                     | text                        |
| storage      | s3_multipart_uploads_parts | version                      | text                        |
| storage      | s3_multipart_uploads_parts | created_at                   | timestamp with time zone    |
| storage      | vector_indexes             | id                           | text                        |
| storage      | vector_indexes             | name                         | text                        |
| storage      | vector_indexes             | bucket_id                    | text                        |
| storage      | vector_indexes             | data_type                    | text                        |
| storage      | vector_indexes             | dimension                    | integer                     |
| storage      | vector_indexes             | distance_metric              | text                        |
| storage      | vector_indexes             | metadata_configuration       | jsonb                       |
| storage      | vector_indexes             | created_at                   | timestamp with time zone    |
| storage      | vector_indexes             | updated_at                   | timestamp with time zone    |
| vault        | decrypted_secrets          | id                           | uuid                        |
| vault        | decrypted_secrets          | name                         | text                        |
| vault        | decrypted_secrets          | description                  | text                        |
| vault        | decrypted_secrets          | secret                       | text                        |
| vault        | decrypted_secrets          | decrypted_secret             | text                        |
| vault        | decrypted_secrets          | key_id                       | uuid                        |
| vault        | decrypted_secrets          | nonce                        | bytea                       |
| vault        | decrypted_secrets          | created_at                   | timestamp with time zone    |
| vault        | decrypted_secrets          | updated_at                   | timestamp with time zone    |
| vault        | secrets                    | id                           | uuid                        |
| vault        | secrets                    | name                         | text                        |
| vault        | secrets                    | description                  | text                        |
| vault        | secrets                    | secret                       | text                        |
| vault        | secrets                    | key_id                       | uuid                        |
| vault        | secrets                    | nonce                        | bytea                       |
| vault        | secrets                    | created_at                   | timestamp with time zone    |
| vault        | secrets                    | updated_at                   | timestamp with time zone    |
