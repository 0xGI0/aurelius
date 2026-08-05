package io.github.oxgi0.aurelius.ui.nav

import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.automirrored.outlined.MenuBook
import androidx.compose.material.icons.outlined.AccountBalance
import androidx.compose.material.icons.outlined.LocalLibrary
import androidx.compose.material.icons.outlined.MilitaryTech
import androidx.compose.material.icons.outlined.StarOutline
import androidx.compose.material3.HorizontalDivider
import androidx.compose.material3.Icon
import androidx.compose.material3.NavigationBar
import androidx.compose.material3.NavigationBarItem
import androidx.compose.material3.NavigationBarItemDefaults
import androidx.compose.material3.Scaffold
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.vector.ImageVector
import androidx.compose.ui.res.stringResource
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.navigation.NavHostController
import androidx.navigation.compose.NavHost
import androidx.navigation.compose.composable
import androidx.navigation.compose.currentBackStackEntryAsState
import androidx.navigation.compose.rememberNavController
import io.github.oxgi0.aurelius.R
import io.github.oxgi0.aurelius.ui.components.Screen
import io.github.oxgi0.aurelius.ui.theme.DarkColors
import androidx.compose.runtime.getValue

/** Tab-Definitionen in Original-Reihenfolge der Expo-App. */
private data class Tab(val route: String, val labelRes: Int, val icon: ImageVector)

private val TABS = listOf(
    Tab("quote", R.string.tab_quote, Icons.AutoMirrored.Outlined.MenuBook),
    Tab("books", R.string.tab_books, Icons.Outlined.LocalLibrary),
    Tab("favorites", R.string.tab_favorites, Icons.Outlined.StarOutline),
    Tab("aurel", R.string.tab_aurel, Icons.Outlined.MilitaryTech),
    Tab("stoa", R.string.tab_stoa, Icons.Outlined.AccountBalance),
)

@Composable
fun AureliusNav(navController: NavHostController = rememberNavController()) {
    val backStack by navController.currentBackStackEntryAsState()
    val currentRoute = backStack?.destination?.route
    val showTabBar = TABS.any { it.route == currentRoute }

    Scaffold(
        containerColor = Color.Transparent,
        bottomBar = { if (showTabBar) AureliusTabBar(navController, currentRoute) },
    ) { padding ->
        NavHost(
            navController = navController,
            startDestination = "quote",
            modifier = Modifier.padding(bottom = padding.calculateBottomPadding()),
        ) {
            composable("quote") { io.github.oxgi0.aurelius.ui.screens.QuoteScreen(navController) }
            composable("books") { io.github.oxgi0.aurelius.ui.screens.BooksScreen(navController) }
            composable("favorites") { io.github.oxgi0.aurelius.ui.screens.FavoritesScreen(navController) }
            composable("aurel") { io.github.oxgi0.aurelius.ui.screens.AurelScreen() }
            composable("stoa") { io.github.oxgi0.aurelius.ui.screens.StoaScreen() }
            composable("settings") { io.github.oxgi0.aurelius.ui.screens.SettingsScreen(navController) }
            composable("book/{book}") { entry ->
                val book = entry.arguments?.getString("book")?.toIntOrNull() ?: -1
                io.github.oxgi0.aurelius.ui.screens.BookScreen(navController, book)
            }
            composable("read/{id}") { entry ->
                val id = entry.arguments?.getString("id") ?: ""
                io.github.oxgi0.aurelius.ui.screens.ReadScreen(navController, id)
            }
        }
    }
}

/** Die Tab-Bar ist wie im Original in BEIDEN Themes dunkel (palettes.dark). */
@Composable
private fun AureliusTabBar(navController: NavHostController, currentRoute: String?) {
    androidx.compose.foundation.layout.Column {
        HorizontalDivider(thickness = 1.dp, color = DarkColors.border)
        NavigationBar(containerColor = DarkColors.card, tonalElevation = 0.dp) {
            TABS.forEach { tab ->
                NavigationBarItem(
                    selected = currentRoute == tab.route,
                    onClick = {
                        navController.navigate(tab.route) {
                            popUpTo(navController.graph.startDestinationId) { saveState = true }
                            launchSingleTop = true
                            restoreState = true
                        }
                    },
                    icon = {
                        Icon(tab.icon, contentDescription = null, modifier = Modifier.size(20.dp))
                    },
                    label = { Text(stringResource(tab.labelRes), fontSize = 11.sp) },
                    colors = NavigationBarItemDefaults.colors(
                        selectedIconColor = DarkColors.accent,
                        selectedTextColor = DarkColors.accent,
                        unselectedIconColor = DarkColors.textSoft,
                        unselectedTextColor = DarkColors.textSoft,
                        indicatorColor = Color.Transparent,
                    ),
                )
            }
        }
    }
}

@Composable
private fun PlaceholderScreen(titleRes: Int) {
    Screen(center = true) {
        Text(
            text = stringResource(titleRes),
            color = io.github.oxgi0.aurelius.ui.theme.LocalColors.current.text,
        )
    }
}
