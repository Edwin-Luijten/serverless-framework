#!/usr/bin/env bash

# Used to easily output colored text
# The following are the list of supported colors and effects (*depends on environment*):
#    COLORS   FG    BG
#    Black	  30	  40
#    Red	    31	  41
#    Green	  32	  42
#    Yellow	  33	  43
#    Blue	    34	  44
#    Magenta  35	  45
#    Cyan	    36	  46
#    White	  37	  47
#
#    EFFECTS
#    Normal         0
#    Bold           1
#    Underlined     4
#    Blinking       5
#    Reverse Video  7
function cecho()
{
    text="${1:-}"
    foreground="${2:-}"

    #check for required vars
    if [[ -z "${text}" ]]; then
        return
    fi

    #check for required vars
    if [[ -z "${foreground}" ]]; then
        echo -e "${text}" && return
    fi

    effect="${3:-}"
    background="${4:-}"
    wrapper="\e["
    reset="\e[0m"

    #foreground
    wrapper="${wrapper}${foreground};"

    #effect
    if [[ -n "${effect}" ]]; then
        wrapper="${wrapper}${effect};"
    fi

    #background
    if [[ -n "${background}" ]]; then
        wrapper="${wrapper}${background};"
    fi

    echo -e "${wrapper:0:-1}m${text}${reset}"
}

function section() {
    text="${1:-}"
    #check for required vars
    if [[ -z "${text}" ]]; then
        return
    fi

    cecho " - ${text}" 34
}

function subsection() {
    text="${1:-}"
    #check for required vars
    if [[ -z "${text}" ]]; then
        return
    fi

    cecho "    - ${text}" 36
}