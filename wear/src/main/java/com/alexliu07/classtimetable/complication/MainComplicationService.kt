package com.alexliu07.classtimetable.complication

import android.util.Log
import androidx.room.Room
import androidx.wear.watchface.complications.data.ComplicationData
import androidx.wear.watchface.complications.data.ComplicationType
import androidx.wear.watchface.complications.data.PlainComplicationText
import androidx.wear.watchface.complications.data.RangedValueComplicationData
import androidx.wear.watchface.complications.datasource.ComplicationRequest
import androidx.wear.watchface.complications.datasource.SuspendingComplicationDataSourceService
import com.alexliu07.classtimetable.AppDatabase
import com.alexliu07.classtimetable.CurrentInfo
import com.alexliu07.classtimetable.R
import com.alexliu07.classtimetable.getCurrentInfo

/**
 * Skeleton for complication data source that returns short text.
 */
class MainComplicationService : SuspendingComplicationDataSourceService() {

    override fun getPreviewData(type: ComplicationType): ComplicationData? {
        val tempData = CurrentInfo(3,this.getString(R.string.complication_example),"",20,40)
        return createComplicationData(tempData)
    }

    override suspend fun onComplicationRequest(request: ComplicationRequest): ComplicationData {
        val db = Room.databaseBuilder(applicationContext, AppDatabase::class.java,"data").allowMainThreadQueries().build()
        val dataDao = db.dataDao()
        val currentInfo = getCurrentInfo(dataDao)
        db.close()
        return createComplicationData(currentInfo)
    }

    private fun createComplicationData(currentInfo: CurrentInfo): RangedValueComplicationData {
        Log.i("complication",currentInfo.toString())
        when (currentInfo.status){
            0 -> return RangedValueComplicationData.Builder(
                value = 0f,
                min = 0f,
                max = 0f,
                contentDescription = PlainComplicationText.Builder(this.getString(R.string.complication_no_schedule)).build(),
            ).setText(PlainComplicationText.Builder(this.getString(R.string.complication_no_schedule)).build()).build()
            1 -> return RangedValueComplicationData.Builder(
                value = 0f,
                min = 0f,
                max = 0f,
                contentDescription = PlainComplicationText.Builder(currentInfo.next).build(),
            ).setText(PlainComplicationText.Builder(currentInfo.next).build()).build()
            2 -> return RangedValueComplicationData.Builder(
                value = currentInfo.progress.toFloat(),
                min = 0f,
                max = currentInfo.total.toFloat(),
                contentDescription = PlainComplicationText.Builder(currentInfo.next).build(),
            ).setText(PlainComplicationText.Builder(currentInfo.next).build()).build()
            3,4 -> return RangedValueComplicationData.Builder(
                value = currentInfo.progress.toFloat(),
                min = 0f,
                max = currentInfo.total.toFloat(),
                contentDescription = PlainComplicationText.Builder(currentInfo.current).build(),
            ).setText(PlainComplicationText.Builder(currentInfo.current).build()).build()
            else -> return RangedValueComplicationData.Builder(
                value = 0f,
                min = 0f,
                max = 0f,
                contentDescription = PlainComplicationText.Builder(this.getString(R.string.complication_error)).build(),
            ).setText(PlainComplicationText.Builder(this.getString(R.string.complication_error)).build()).build()
        }
    }

}