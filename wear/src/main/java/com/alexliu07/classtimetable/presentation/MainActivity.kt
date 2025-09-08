/* While this template provides a good starting point for using Wear Compose, you can always
 * take a look at https://github.com/android/wear-os-samples/tree/main/ComposeStarter to find the
 * most up to date changes to the libraries and their usages.
 */

package com.alexliu07.classtimetable.presentation

import android.R.style
import android.os.Bundle
import android.util.Log
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.compose.foundation.background
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.PaddingValues
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.pager.HorizontalPager
import androidx.compose.foundation.pager.rememberPagerState
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.runtime.Composable
import androidx.compose.runtime.mutableStateListOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.snapshots.SnapshotStateList
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.res.stringResource
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.tooling.preview.Preview
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.core.splashscreen.SplashScreen.Companion.installSplashScreen
import androidx.wear.compose.foundation.lazy.ScalingLazyColumn
import androidx.wear.compose.foundation.lazy.items
import androidx.wear.compose.foundation.lazy.rememberScalingLazyListState
import androidx.wear.compose.material.MaterialTheme
import androidx.wear.compose.material3.Card
import androidx.wear.compose.material3.ListHeader
import androidx.wear.compose.material3.Text
import androidx.wear.tooling.preview.devices.WearDevices
import com.alexliu07.classtimetable.R.string
import com.alexliu07.classtimetable.presentation.theme.ClassTimetableTheme
import com.google.android.gms.wearable.DataClient
import com.google.android.gms.wearable.DataEvent
import com.google.android.gms.wearable.DataEventBuffer
import com.google.android.gms.wearable.DataMapItem
import com.google.android.gms.wearable.Wearable

class MainActivity : ComponentActivity() , DataClient.OnDataChangedListener {

    override fun onResume() {
        super.onResume()
        Log.i("listener","data listener added")
        Wearable.getDataClient(this).addListener(this)
    }

    override fun onPause() {
        super.onPause()
        Log.i("listener","data listener removed")
        Wearable.getDataClient(this).removeListener(this)
    }

    override fun onDataChanged(dataEvents: DataEventBuffer) {
        Log.i("listener","event get")
        for (event in dataEvents) {
            if (event.type == DataEvent.TYPE_CHANGED) {
                val dataItem = event.dataItem
                if (dataItem.uri.path == "/data") {
                    // 处理接收到的数据
                    val dataMap = DataMapItem.fromDataItem(dataItem).dataMap
                    Log.i("data",dataMap.toString())
                }
            } else if (event.type == DataEvent.TYPE_DELETED) {
                // 处理数据项被删除
                Log.i("data","deleted")
            }
        }
    }

    override fun onCreate(savedInstanceState: Bundle?) {
        installSplashScreen()
        super.onCreate(savedInstanceState)
        setTheme(style.Theme_DeviceDefault)
        setContent {
            WearApp("Android")
        }

    }
}

data class ListItem(val id: Int, val time: String, val subject: String)

@Composable
fun WearApp(greetingName: String) {
    ClassTimetableTheme {
        Box(
            modifier = Modifier
                .fillMaxSize()
                .background(MaterialTheme.colors.background),
            contentAlignment = Alignment.Center
        ) {
            ClassDisplay()
        }
    }
}

@Composable
fun ClassDisplay(){
    val pageCount = 7
    val pagerState = rememberPagerState { pageCount }

    @Composable
    fun loadData(pageNumber:Int): SnapshotStateList<ListItem> {
        val itemList = remember { mutableStateListOf<ListItem>() }
        var nextItemId = remember { 0 }
        if (itemList.isEmpty()) {
            repeat(3) {index->
                itemList.add(ListItem(nextItemId++, "9:00","page $pageNumber - $index"))
            }
        }
        return itemList
    }

    Column( // Use a Column to stack Pager and Indicators
        modifier = Modifier.fillMaxSize(),
        horizontalAlignment = Alignment.CenterHorizontally
    ) {
        HorizontalPager(
            state = pagerState,
            modifier = Modifier
                .weight(1f)
                .fillMaxWidth()
        ) { page ->
            PageContent(pageNumber = page, pageContent = loadData(page))
        }
        // Page Indicators
        Row(
            Modifier
                .height(20.dp)
                .fillMaxWidth()
                .padding(bottom = 4.dp), // Add some padding at the bottom
            horizontalArrangement = Arrangement.Center,
            verticalAlignment = Alignment.CenterVertically
        ) {
            repeat(pageCount) { iteration ->
                val color =
                    if (pagerState.currentPage == iteration) MaterialTheme.colors.primary else Color.LightGray
                Box(
                    modifier = Modifier
                        .padding(horizontal = 2.dp)
                        .clip(CircleShape)
                        .background(color)
                        .size(6.dp) // Size of the dot
                )
            }
        }
    }
}

@Composable
fun PageContent(pageNumber:Int,pageContent: SnapshotStateList<ListItem>){
    Log.i("page","$pageNumber $pageContent")
    Box(
        modifier = Modifier
            .fillMaxSize()
            .padding(4.dp),
        contentAlignment = Alignment.Center
    ){
        val listState = rememberScalingLazyListState()
        ScalingLazyColumn(
            modifier = Modifier.fillMaxSize(),
            state = listState,
            contentPadding = PaddingValues(
                top = 8.dp,
                bottom = 8.dp,
                start = 8.dp,
                end = 8.dp
            ),
            verticalArrangement = Arrangement.spacedBy(8.dp),
            horizontalAlignment = Alignment.CenterHorizontally,
        ) {
            item{
                ListHeader (
                    modifier = Modifier.fillMaxWidth(),
                ){
                    val dayText = when(pageNumber){
                        0 -> stringResource(id = string.day0)
                        1 -> stringResource(id = string.day1)
                        2 -> stringResource(id = string.day2)
                        3 -> stringResource(id = string.day3)
                        4 -> stringResource(id = string.day4)
                        5 -> stringResource(id = string.day5)
                        6 -> stringResource(id = string.day6)
                        else -> ""
                    }
                    Text(text=dayText)
                }
            }
            items(pageContent){item->
                Card(
                    onClick = { /* Do something */ },
                    modifier = Modifier
                        .fillMaxWidth()
                        .padding(horizontal = 8.dp)
                ) {
                    Text(
                        text = item.time,
                        fontSize = 10.sp
                    )
                    Text(
                        text = item.subject,
                        fontSize = 16.sp,
                        fontWeight = FontWeight.Bold
                    )
                }
            }
        }
    }
}


@Preview(device = WearDevices.SMALL_ROUND, showSystemUi = true)
@Composable
fun DefaultPreview() {
    WearApp("Preview Android")
}