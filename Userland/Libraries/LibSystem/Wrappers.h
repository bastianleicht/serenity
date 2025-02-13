/*
 * Copyright (c) 2021, Andreas Kling <kling@serenityos.org>
 *
 * SPDX-License-Identifier: BSD-2-Clause
 */

#pragma once

#include <AK/Error.h>
#include <signal.h>

namespace System {

ErrorOr<void> pledge(StringView promises, StringView execpromises);
ErrorOr<void> unveil(StringView path, StringView permissions);
ErrorOr<void> sigaction(int signal, struct sigaction const* action, struct sigaction* old_action);

}
